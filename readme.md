# Panels and Layers

## A JavaScript Framework for Parallaxing

Sometimes you need to create some movement, a sense of parallax between things on the screen. Normally this can be a painful experience as you try to work out the plugins, code, ratios, blah blah blah.

Panels And Layers attempts to take away the pain and get you in to building your parallaxy site as quick as possible.

The framework is based on a concept of "Panels" - static areas that contain fluid elements; and "Layers" that can be positioned, styled and animated.

## Getting Started

To get going you'll want to include all the required JavaScript and CSS files.

A typical panel signature will look like this:

    <div class="panel">
        <!-- Standard Panel -->
        <div class="layer" data-inertia="1.2" data-min="200" data-max="400">
            <p>layer content</p>
        </div>

        <!-- Horizontally animated panel -->
        <div class="layer" data-inertia="-1.2" data-min="200" data-max="400" data-property="left">
            <p>layer content</p>
        </div>

    </div>

## HTML Options

### Panels

    [animate] - (Boolean)
        If specified, the background image will be animated with a given inertia
    [inertia] - (Float)
        Optional inertia for background image animation

### Layers

    inertia - (Float)
        Takes care of the rate and direction of movement (it is a signed value i.e. it can be positive or negative)
    [min] - (Int)
    [max] - (Int)
        The layer will not move beyond these bounds

    [property] - (String) top|left|bottom|right
        Will animate the specified position property.
        In most cases "top" and "left" will be the values you want and then control the direction with a given inertia

## JavaScript Options
