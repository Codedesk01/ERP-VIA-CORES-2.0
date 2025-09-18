from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(100), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    path = db.Column(db.String(500), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('uploaded_images', lazy=True))

    def __repr__(self):
        return f'<Image {self.sku}>'

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'filename': self.filename,
            'path': self.path,
            'uploaded_by': self.user.username if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

