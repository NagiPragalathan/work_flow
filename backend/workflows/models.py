"""
Django models for workflows
"""
from django.db import models
from django.contrib.auth.models import User
import uuid


class Workflow(models.Model):
    """Workflow model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    nodes = models.JSONField(default=list)
    edges = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class WorkflowExecution(models.Model):
    """Workflow execution history"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='executions')
    status = models.CharField(max_length=50, choices=[
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('error', 'Error'),
        ('stopped', 'Stopped')
    ])
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    execution_order = models.JSONField(default=list)
    node_states = models.JSONField(default=dict)
    errors = models.JSONField(default=dict)
    trigger_data = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.workflow.name} - {self.status} - {self.started_at}"


class MemoryCollection(models.Model):
    """Memory collection for storing conversation memory"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    workflow_id = models.CharField(max_length=255)
    node_id = models.CharField(max_length=255)
    window_size = models.IntegerField(default=20)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.workflow_id}"


class MemoryMessage(models.Model):
    """Individual memory message"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collection = models.ForeignKey(MemoryCollection, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=50, choices=[
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
        ('tool', 'Tool')
    ])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class Credential(models.Model):
    """Stored credentials for integrations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    credential_type = models.CharField(max_length=100)
    data = models.JSONField(default=dict)  # Encrypted in production
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.credential_type})"


class ExportedWorkflow(models.Model):
    """Exported workflow templates for sharing and reuse"""
    EXPORT_TYPES = [
        ('with-credentials', 'With Credentials'),
        ('without-credentials', 'Without Credentials'),
        ('template', 'Template'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    version = models.CharField(max_length=20, default='1.0.0')
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPES, default='template')
    
    # Workflow data
    nodes = models.JSONField(default=list)
    edges = models.JSONField(default=list)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    category = models.CharField(max_length=100, blank=True)
    author = models.CharField(max_length=255, blank=True)
    is_public = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    exported_at = models.DateTimeField(auto_now_add=True)
    
    # Usage statistics
    download_count = models.PositiveIntegerField(default=0)
    import_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-exported_at']
        indexes = [
            models.Index(fields=['export_type']),
            models.Index(fields=['is_public']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.export_type})"
    
    def increment_download_count(self):
        """Increment download count"""
        self.download_count += 1
        self.save(update_fields=['download_count'])
    
    def increment_import_count(self):
        """Increment import count"""
        self.import_count += 1
        self.save(update_fields=['import_count'])