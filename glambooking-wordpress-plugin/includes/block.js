/**
 * GlamBooking Gutenberg Block
 */

const { registerBlockType } = wp.blocks;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, TextControl, SelectControl, RangeControl } = wp.components;
const { __ } = wp.i18n;

registerBlockType('glambooking/booking-widget', {
    title: __('GlamBooking', 'glambooking'),
    description: __('Embed GlamBooking appointment system', 'glambooking'),
    icon: 'calendar-alt',
    category: 'widgets',
    keywords: [
        __('booking', 'glambooking'),
        __('appointment', 'glambooking'),
        __('glambooking', 'glambooking'),
    ],
    
    attributes: {
        businessId: {
            type: 'string',
            default: '',
        },
        service: {
            type: 'string',
            default: '',
        },
        theme: {
            type: 'string',
            default: 'default',
        },
        height: {
            type: 'number',
            default: 600,
        },
    },
    
    edit: function(props) {
        const { attributes, setAttributes } = props;
        const { businessId, service, theme, height } = attributes;
        
        return [
            wp.element.createElement(
                InspectorControls,
                { key: 'inspector' },
                wp.element.createElement(
                    PanelBody,
                    { title: __('Settings', 'glambooking'), initialOpen: true },
                    wp.element.createElement(TextControl, {
                        label: __('Business ID', 'glambooking'),
                        value: businessId,
                        onChange: (value) => setAttributes({ businessId: value }),
                        help: __('Leave empty to use default from settings', 'glambooking'),
                    }),
                    wp.element.createElement(TextControl, {
                        label: __('Pre-select Service', 'glambooking'),
                        value: service,
                        onChange: (value) => setAttributes({ service: value }),
                        help: __('Optional service category filter', 'glambooking'),
                    }),
                    wp.element.createElement(SelectControl, {
                        label: __('Theme', 'glambooking'),
                        value: theme,
                        options: [
                            { label: __('Default', 'glambooking'), value: 'default' },
                            { label: __('Minimal', 'glambooking'), value: 'minimal' },
                            { label: __('Dark', 'glambooking'), value: 'dark' },
                        ],
                        onChange: (value) => setAttributes({ theme: value }),
                    }),
                    wp.element.createElement(RangeControl, {
                        label: __('Height (px)', 'glambooking'),
                        value: height,
                        onChange: (value) => setAttributes({ height: value }),
                        min: 400,
                        max: 1200,
                        step: 50,
                    })
                )
            ),
            wp.element.createElement(
                'div',
                { 
                    key: 'preview',
                    className: 'glambooking-block-preview',
                    style: {
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '20px',
                        textAlign: 'center',
                        minHeight: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }
                },
                wp.element.createElement('div', {},
                    wp.element.createElement('span', {
                        className: 'dashicons dashicons-calendar-alt',
                        style: { fontSize: '48px', color: '#000', marginBottom: '10px' }
                    }),
                    wp.element.createElement('p', { style: { margin: '10px 0 0 0', fontWeight: 'bold' } },
                        __('GlamBooking Appointment Widget', 'glambooking')
                    ),
                    wp.element.createElement('p', { style: { margin: '5px 0 0 0', fontSize: '12px', color: '#666' } },
                        businessId 
                            ? __('Business ID: ', 'glambooking') + businessId
                            : __('Using default business ID', 'glambooking')
                    )
                )
            ),
        ];
    },
    
    save: function() {
        // Render handled by PHP
        return null;
    },
});
