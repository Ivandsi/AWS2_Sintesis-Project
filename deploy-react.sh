#!/bin/bash

REACT_FOLDER=frontend
echo "Construint projecte React..."
cd $REACT_FOLDER
npm install
npm run build
cd ..

echo "Transferint arxius estàtics al projecte Django"
mkdir -p core/templates
mkdir -p core/static
cp $REACT_FOLDER/dist/index.html core/templates/index.html
cp -r $REACT_FOLDER/dist/static core/

echo "Desplegament finalitzat."
echo "Pots posar en marxa el servidor amb './manage.py runserver'"
