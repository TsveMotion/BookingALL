import { config } from '../config';

// Using Upstash Redis REST API
class UpstashRedis {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  private async fetch(command: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.url}/${command.join('/')}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Redis fetch error:', error);
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.fetch(['get', key]);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.fetch(['setex', key, ttl.toString(), value]);
    } else {
      await this.fetch(['set', key, value]);
    }
  }

  async del(key: string): Promise<void> {
    await this.fetch(['del', key]);
  }
}

let redis: UpstashRedis | null = null;

try {
  if (config.redis.url && config.redis.token) {
    redis = new UpstashRedis(config.redis.url, config.redis.token);
    console.log('✅ Upstash Redis configured');
  } else {
    console.warn('⚠️  Redis not configured, caching disabled');
  }
} catch (error) {
  console.warn('⚠️  Redis initialization failed, caching disabled');
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), ttlSeconds);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    // Note: Upstash REST API doesn't support KEYS pattern, so we'll just log a warning
    console.warn('delPattern not supported with Upstash REST API');
  },
};

export default redis;
