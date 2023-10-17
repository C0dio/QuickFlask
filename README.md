# QuickFlask
This is a little project where I can explore Draggable UI and further improve my database knowledge.

## Usage
Clone the repository and run the Flask application;

```shell
# NB: you don't need to specify the app name
flask run
```

## Dependencies
You will need to have the following packages installed;
* Flask: 3.0.0+,
* Flask-SQLAlchemy: 3.1.1+,
* Python: 3.8+

## Quick Look
<img src="https://github.com/C0dio/QuickFlask/assets/68840768/7539cc2f-9273-41c6-a8a2-5bd1f3381a79" width="300" />

## Roadmap

### Phase 1 - Generic Utilities
* The user is able to place several `Nodes` on the canvas.
* The user is able to interact with the `Nodes` and create new objects.
* The user is able to create `Label Nodes` and edit the text inside the labels.

### Phase 2 - Scenes
* The user is able to save the position and attributes of all the `Nodes` on the canvas into a `Scene`.
* The user is able to save multiple different `Scenes`.
* The user is able to switch between `Scenes` with minimal delay.
* The user is able to delete `Scenes`.
* The user is able to delete `Nodes`.

### Phase 3 - Quality of Life
* The user is able to change additional attributes of the `Nodes` including colour, size and font.
* The user is able to toggle 'autosave' so they don't have to keep clicking save.

### Phase 4 - Relationships
* The user is able to create a line.
* The user is able to rotate Nodes on a scene.

### Phase 5 - Demo
* Anyone who clones the project will have access to a `Sandbox Scene` where they can play around with the application.
