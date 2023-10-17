from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey
from typing import List, Optional

import enum

class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class AlchemyDB:
    """
    Simple Alchemy DB Wrapper Class
    """

    def __init__(self, app):
        global db
        self.db = db
        self.app = app

        # app configurations
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
        db.init_app(app)
    
    def init_models(self):
        with self.app.app_context():
            db.drop_all()
            db.create_all()

    def get_by_field(self, table, field, value):
        return table.query.filter_by(**{field: value}).first()

    def add(self, record):
        db.session.add(record)
        db.session.commit()

    def delete(self, record):
        db.session.delete(record)
        db.session.commit()

    def get(self, field, table):

        def __field(row):
            return getattr(row, field)

        return list(map(__field, self.db.session.execute(self.db.select(table)).scalars().all()))


class NodeTypes(enum.Enum):
    # label types
    LABEL = "textarea-t"
    INPUT = "input-cursor-text"

    # shape types
    CIRCLE = "circle"
    SQUARE = "square"
    TRIANGLE = "triangle"

    # misc types
    ARROW = "arrows"


class NodesModel(db.Model):
    __tablename__ = "nodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ref_id: Mapped[str] = mapped_column(String(36), unique=True)
    type: Mapped[NodeTypes]
    font: Mapped[str] = mapped_column(String)
    size: Mapped[str] = mapped_column(String)
    text: Mapped[str] = mapped_column(String)
    xpos: Mapped[int] = mapped_column(Integer)
    ypos: Mapped[int] = mapped_column(Integer)
    color: Mapped[str] = mapped_column(String)
    rotation: Mapped[int] = mapped_column(Integer)
    # one scenes for many nodes relationship
    scene_id: Mapped[int] = mapped_column(ForeignKey("scenes.id"))


class ScenesModel(db.Model):
    __tablename__ = "scenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    # one scene for many nodes relationship
    nodes: Mapped[Optional[List["NodesModel"]]] = relationship(cascade="all, delete-orphan")

