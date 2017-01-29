# Servidor central

Proceso de instalación del servidor central:

- Imagen
  - Rasbian Jessie
  
- Node
  - curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  - sudo apt-get install -y nodejs

- Mongo
  - sudo apt-get update
  - sudo apt-get upgrade
  - sudo apt-get install mongodb-server
  - sudo service mongodb start
