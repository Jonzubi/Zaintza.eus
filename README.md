# ProyectoAplicacionWeb
El proyecto de SEIM para Aplicación Web de 2º

**Herramientas necesarias para descargar y ejecutar el proyecto:**

- Npm
- MongoDB
- Git 

**Pasos para reproducir el proyecto en un entorno local**

- Clonar el proyecto mediante este comando: "git clone https://github.com/Jonzubi/ProyectoAplicacionWeb.git"
- En la raíz donde se ha ejecutado el proyecto aparecerá una carpeta que se llama *ProyectoAplicacionWeb*.
- Con la terminal acceder a la carpeta ./API dentro de la carpeta clonada y hacer un: "npm i" (Esto traerá todos los modulos y dependencias necesarias).
- Despues hacer lo mismo colocandose en la carpeta ./APP respecto a la carpeta clonada. Al acabar este paso ya esta todo lo necesario instalado.
- Colocar otra vez en ./API con la terminal y hacer: npm run start. Es un comando que lanza la API y se pone escuchando el puerto :3001
- Abrir otra terminal, colocarse en ./APP y hacer: npm start. Este comando compila el proyecto y lo va a lanzar automaticamente en el navegador predeterminado especificado por el sistema operativo.
- Abrir un ultimo terminal y colocarse en ./SOCKET y darle a npm start. Con este comando se va a poner en marcha el sevidor de notificaciones.
- Ya se podrá utilizar la aplicacion.

**Notas**

- Es necesario tener conexión a internet ya que la aplicacion accede a una base de datos en la nube.
