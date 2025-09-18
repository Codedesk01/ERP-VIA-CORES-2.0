from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db
import json

class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=True)  # Nome do grupo ou null para conversa individual
    participants = db.Column(db.Text, nullable=False)  # JSON array de usernames
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_participants(self):
        return json.loads(self.participants) if self.participants else []

    def set_participants(self, participants):
        self.participants = json.dumps(participants)

    def __repr__(self):
        return f'<Conversation {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'participants': self.get_participants(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.Text, nullable=True)
    attachment = db.Column(db.Text, nullable=True)  # JSON com dados do anexo
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read_by = db.Column(db.Text, nullable=False, default='[]')  # JSON array de usernames que leram

    conversation = db.relationship('Conversation', backref=db.backref('messages', lazy=True))
    sender = db.relationship('User', backref=db.backref('sent_messages', lazy=True))

    def get_attachment(self):
        return json.loads(self.attachment) if self.attachment else None

    def set_attachment(self, attachment):
        self.attachment = json.dumps(attachment) if attachment else None

    def get_read_by(self):
        return json.loads(self.read_by) if self.read_by else []

    def set_read_by(self, read_by):
        self.read_by = json.dumps(read_by)

    def __repr__(self):
        return f'<Message {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender': self.sender.username if self.sender else None,
            'text': self.text,
            'attachment': self.get_attachment(),
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'read_by': self.get_read_by()
        }

