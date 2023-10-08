from flask import Flask, render_template, request
from db import AlchemyDB, ScenesModel, NodesModel, NodeTypes

from uuid import uuid4
import json

app = Flask(__name__)
db  = AlchemyDB(app)
db.init_models()

@app.route('/')
def main():
    app.logger.warning(db.get('name', ScenesModel))
    return render_template('main.html', scenes = db.get('name', ScenesModel))


@app.route('/load/scene/<string:name>')
def load_scene(name):
    db_scene = db.get_by_field(ScenesModel, 'name', name)
    
    # check the scene exists
    if not db_scene:
        return 'Scene not found', 404
    
    # convert nodes to a dict generator
    def _dict(nodes):
        for node in nodes:
            yield {
                'id': node.ref_id,
                'type': node.type.value,
                'xpos': node.xpos,
                'ypos': node.ypos
            }
    
    # return the nodes of the scene
    return {
        'nodes': json.dumps(list(_dict(db_scene.nodes)))
    }, 200


@app.route('/save/scene', methods=['POST'])
def save_scene():
    response = request.get_json()
    nodes = response.get('nodes', None)
    scene_name = response.get('scene_id', uuid4())

    # get or create the scene
    db_scene = db.get_by_field(ScenesModel, 'name', scene_name)
    if not db_scene:
        db_scene = ScenesModel(name=scene_name)
        db.add(db_scene)
    
    # if no nodes are attached then just create the scene
    if not nodes:
        return 'Created Scene', 201

    # remove all the nodes in the scene to handle duplicate or deleted nodes
    db_scene.nodes = []

    # create and add the nodes to the scene
    for node in nodes:
        # parse the node
        node_id =   node.get('ref_id', str(uuid4()))
        node_type = node.get('type', 'circle')
        node_xpos = node.get('xpos', 0)
        node_ypos = node.get('ypos', 0)
        # only add new nodes
        db_node = db.get_by_field(NodesModel, 'ref_id', node_id)
        if not db_node:
            db_node = NodesModel(
                ref_id=node_id,
                type=NodeTypes(node_type),
                xpos=node_xpos,
                ypos=node_ypos,
                scene_id=db_scene.id
            )
            db.add(db_node)

    return 'Your scene has been saved', 200


@app.route('/scene/<string:name>', methods=['DELETE'])
def delete_scene(name):
    db_scene = db.get_by_field(ScenesModel, 'name', name)
    
    # check the scene exists
    if not db_scene:
        return 'Scene not found', 404
    
    # remove the scene from the db
    db.delete(db_scene)
    return 'Scene deleted', 200