from django.contrib import admin
from .models import User, LogFile, LogEntry, Alert

admin.site.register(User)
admin.site.register(LogFile)
admin.site.register(LogEntry)
admin.site.register(Alert)