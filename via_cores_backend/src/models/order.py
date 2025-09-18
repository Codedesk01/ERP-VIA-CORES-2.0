from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    marketplace = db.Column(db.String(100), nullable=False)
    order_id = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    status = db.Column(db.String(50), nullable=False, default='Pendente')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('orders', lazy=True))

    def __repr__(self):
        return f'<Order {self.order_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'marketplace': self.marketplace,
            'order_id': self.order_id,
            'sku': self.sku,
            'quantity': self.quantity,
            'status': self.status,
            'user': self.user.username if self.user else None,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

