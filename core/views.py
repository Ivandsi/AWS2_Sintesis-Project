from django.shortcuts import render
from django.http import HttpResponse
from django.views.static import serve
from django.template.loader import get_template
from django.template.exceptions import TemplateDoesNotExist
from django.core.exceptions import PermissionDenied
import os

def index(response):
    try:
        return render(response,"index.html")
    except TemplateDoesNotExist:
        return HttpResponse("Backend OK. Posa en marxa el frontend seguint el README.")