/**
 * GlamBooking WordPress Plugin - Public JavaScript
 * Handles booking widget interactions
 */

(function() {
    'use strict';
    
    // Widget initialization
    function initGlamBookingWidgets() {
        const widgets = document.querySelectorAll('.glambooking-widget');
        
        widgets.forEach(function(widget) {
            const iframe = widget.querySelector('iframe');
            
            if (!iframe) return;
            
            // Add loading state
            widget.classList.add('glambooking-loading');
            
            // Handle iframe load
            iframe.addEventListener('load', function() {
                widget.classList.remove('glambooking-loading');
                widget.classList.add('glambooking-loaded');
            });
            
            // Handle messages from iframe
            window.addEventListener('message', function(event) {
                // Verify origin
                if (event.origin !== 'https://book.glambooking.co.uk') {
                    return;
                }
                
                const data = event.data;
                
                // Handle booking completed event
                if (data.type === 'booking_completed') {
                    handleBookingCompleted(data.booking);
                }
                
                // Handle height adjustment
                if (data.type === 'resize_height') {
                    if (data.height) {
                        iframe.style.height = data.height + 'px';
                    }
                }
            });
        });
    }
    
    // Handle booking completion
    function handleBookingCompleted(booking) {
        // Fire custom event
        const event = new CustomEvent('glambooking_completed', {
            detail: { booking: booking }
        });
        document.dispatchEvent(event);
        
        // Google Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_completed', {
                'event_category': 'GlamBooking',
                'event_label': booking.service,
                'value': booking.price
            });
        }
        
        // Facebook Pixel tracking (if available)
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Schedule', {
                content_name: booking.service,
                value: booking.price,
                currency: 'GBP'
            });
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlamBookingWidgets);
    } else {
        initGlamBookingWidgets();
    }
    
})();
