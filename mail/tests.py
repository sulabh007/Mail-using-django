
from rest_framework import serializers            
from .models import Email 

class EmailSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model=Email
        fields=('sender','recipients','subject','body' )