from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    action = db.Column(db.Text, nullable=False)

    user = db.relationship('User', backref=db.backref('logs', lazy=True))

    def __repr__(self):
        return f'<Log {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'user': self.user.username if self.user else 'Sistema',
            'action': self.action
        }

