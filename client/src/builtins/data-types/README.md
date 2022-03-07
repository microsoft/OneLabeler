# README

## API Design Choices

1. VDisplay of data objects should expose slots for displaying interaction overlays

Otherwise, if the overlays are trivially covering the entire VDisplay, some of the edge cases cannot be handled.
For example, for a point cloud display that shows a main view together with three side views, the developer may want the overlay to only cover the main view.
