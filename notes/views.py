from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Note
from .serializers import NoteSerializer

@api_view(["GET"])
def available_notes(request):
    notes = Note.objects.order_by("-created_at")
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def create_note(request):
    serializer = NoteSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"status": "success"})
    return Response({"status": "error", "message": serializer.errors})


@api_view(["GET"])
def delete_note(request, note_id):
    try:
        note = Note.objects.get(id=note_id)
        note.delete()
        return Response({"status": "success", "message": "Note deleted"})
    except Note.DoesNotExist:
        return Response({"status": "error", "message": "Note not found"})

def home(request):
    return render(request, "notes/index.html")