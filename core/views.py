from django.shortcuts import render
from django.http import HttpResponse
from django.views.static import serve
from django.template.loader import get_template
from django.template.exceptions import TemplateDoesNotExist
from django.core.exceptions import PermissionDenied
import os

def index(response):
    try:
        tpl = get_template("index.html")
        return render(response,"index.html")
    except TemplateDoesNotExist:
        return HttpResponse("Backend OK. Posa en marxa el frontend seguint el README.")
    
def protected_serve(request, path, document_root=None, show_indexes=False):
    full_path = os.path.join(document_root, path)

    # If the path is a directory, deny access
    if os.path.isdir(full_path):
        raise PermissionDenied()
        #return HttpResponseForbidden("Accés denegat.")

    # Otherwise serve the file normally
    return serve(request, path, document_root=document_root, show_indexes=show_indexes)