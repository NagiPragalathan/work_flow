"""
Django REST Framework serializers for workflows
"""
from rest_framework import serializers
from .models import Workflow, WorkflowExecution, Credential, ExportedWorkflow


class WorkflowSerializer(serializers.ModelSerializer):
    """Serializer for Workflow model"""
    
    class Meta:
        model = Workflow
        fields = ['id', 'name', 'description', 'nodes', 'edges', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkflowExecutionSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowExecution model"""
    
    class Meta:
        model = WorkflowExecution
        fields = [
            'id', 'workflow', 'status', 'started_at', 'finished_at',
            'execution_order', 'node_states', 'errors', 'trigger_data'
        ]
        read_only_fields = ['id', 'started_at']


class CredentialSerializer(serializers.ModelSerializer):
    """Serializer for Credential model"""
    
    class Meta:
        model = Credential
        fields = ['id', 'name', 'credential_type', 'data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExecuteWorkflowSerializer(serializers.Serializer):
    """Serializer for workflow execution request"""
    trigger_data = serializers.JSONField(required=False, default=dict)
    start_node_id = serializers.CharField(required=False, allow_null=True)
    credentials = serializers.JSONField(required=False, default=dict)


class ExecuteNodeSerializer(serializers.Serializer):
    """Serializer for single node execution request"""
    node_id = serializers.CharField(required=True)
    trigger_data = serializers.JSONField(required=False, default=dict)
    credentials = serializers.JSONField(required=False, default=dict)


class ExportedWorkflowSerializer(serializers.ModelSerializer):
    """Serializer for ExportedWorkflow model"""
    
    class Meta:
        model = ExportedWorkflow
        fields = [
            'id', 'name', 'description', 'version', 'export_type',
            'nodes', 'edges', 'tags', 'category', 'author',
            'is_public', 'is_featured', 'created_at', 'updated_at',
            'exported_at', 'download_count', 'import_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'exported_at', 'download_count', 'import_count']


class ExportedWorkflowCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating exported workflows"""
    
    class Meta:
        model = ExportedWorkflow
        fields = [
            'name', 'description', 'version', 'export_type',
            'nodes', 'edges', 'tags', 'category', 'author',
            'is_public', 'is_featured'
        ]
    
    def validate_nodes(self, value):
        """Validate nodes data"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Nodes must be a list")
        return value
    
    def validate_edges(self, value):
        """Validate edges data"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Edges must be a list")
        return value


class ExportedWorkflowListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for exported workflow lists"""
    
    class Meta:
        model = ExportedWorkflow
        fields = [
            'id', 'name', 'description', 'version', 'export_type',
            'category', 'author', 'is_public', 'is_featured',
            'exported_at', 'download_count', 'import_count'
        ]
        read_only_fields = ['id', 'exported_at', 'download_count', 'import_count']

