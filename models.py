from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class Severity(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst")
    created_at = Column(DateTime, default=datetime.utcnow)

class LogFile(Base):
    __tablename__ = "log_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500))
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="pending")

class LogEntry(Base):
    __tablename__ = "log_entries"
    id = Column(Integer, primary_key=True, index=True)
    log_file_id = Column(Integer, ForeignKey("log_files.id"))
    timestamp = Column(DateTime)
    ip = Column(String(45))
    event = Column(String(100))
    message = Column(Text)
    severity = Column(Enum(Severity), default=Severity.LOW)
    is_anomaly = Column(Integer, default=0)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    log_entry_id = Column(Integer, ForeignKey("log_entries.id"))
    severity = Column(Enum(Severity), nullable=False)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_resolved = Column(Integer, default=0)
