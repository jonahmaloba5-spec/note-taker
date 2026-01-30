

# Create your models here.
from django.db import models

class Note(models.Model):
    author = models.CharField(max_length=30)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author}: {self.note[:20]}"
