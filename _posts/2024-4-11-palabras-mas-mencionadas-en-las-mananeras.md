---  
layout: post  
title: Programé una web para ver las palabras más mencionadas en las mañaneras
---

La web es [palabrera.info](https://palabrera.info), muestra nubes de palabras de las [conferencias diarias](https://palabrera.info/conferencias_diarias) y tiene una [búsqueda](https://palabrera.info/busqueda) muy simple para encontrar las conferencias en las que cierta palabra fue de las 10 más mencionadas.

También generé gráficas de ciertos periodos acumulados, como la de aquí abajo que es de lo más mencionado en todas las mañaneras. Sorpresivamente (al menos para mi), no están temas como "opositores" o "mafia", aunque sí algunos como "pueblo", "salud" o en periodos más recientes, "medios".

![Nube de palabras de las palabras más mencionadas en las mañaneras de AMLO, hasta Abril de 2024]({{ site.baseurl }}/images/wordcloud_mananeras_all_time.png)

Vi que ha habido algunos proyectos parecidos, incluida [una publicación en Reddit](https://www.reddit.com/r/mexico/comments/ft3rz0/nube_de_palabras_de_amlo_de_la_ma%C3%B1anera_de_hoy/), pero no encontré alguno que cubriera todas las conferencias o que permitiera buscar. Esto puede ser útil para alguien que busque referencias de la mañanera o quiera saber cuándo se habló de algún tema. También es un proyecto que hice como práctica de ingeniería y análisis de datos porqué últimamente he estado aprendiendo y [creando contenido](tiktok.com/@mkfnx) sobre esos temas.

En el procesamiento del texto se omiten palabras comunes pero poco relevantes ([stopwords](https://es.wikipedia.org/wiki/Palabra_vac%C3%ADa#:~:text=Palabras%20vac%C3%ADas%20es%20el%20nombre,en%20lenguaje%20natural%20%28texto%29.)). Usé una lista ya establecida de [stopwords de la biblioteca nltk](https://www.nltk.org/search.html?q=stopwords), pero esto depende mucho del contexto y después de generar algunas gráficas decidí agregar más stopwords, esas se pueden ver en la sección de [Sobre este sitio](https://palabrera.info/sobre_este_sitio).

Voy a liberar el código en GitHub en cuánto haga algunos ajustes, ya que fue algo muy express y aún requiere modificaciones y pasos manuales para generar gráficas nuevas. Algo valioso de liberar el código, sería que alguien con más contexto sobre alguna conferencia pudiera generar las gráficas con una lista de stopwords más adecuada.

Agradezco cualquier feedback, sugerencia de feature, etc.

### Algunos detalles técnicos 🤓

Hice scrapping de la [página del gobierno que publica la versión estenográfica](%60presidente.gob.mx/secciones/version-estenografica/%60) de las conferencias y las almacené todo el texto en un txt por día. Aunque algunas transcripciones tienen la fecha mal indicada.

Con la biblioteca [WordCloud for Python](https://amueller.github.io/word_cloud/) generé mapas de frecuencias y las gráficas de nubes. También incluyo una gráfica de barras creada con matplotlib para que en palabras con menciones similares quede más claro cuál es la más mencionada.

La web está hosteada en firebase, solo es el HTML/CSS y archivos JSON (previamente generados con python) que asocian las fechas con los recursos correspondientes.

El front está medio feito 😛, está hecho a partir de los ejemplos de bootstrap, y hay un poco de JS vanilla para la selección de fecha y la búsqueda. Es básicamente una SPA muy simple, solo que tiene años que no manejo un FW para eso y pues tocó JS pelón.

La "búsqueda" está implementada con un diccionario con las palabras como llave y la lista de fechas asociadas como valor, entonces solo tomo el input del usuario y muestro las fechas correspondientes. Ese diccionario se creo a partir de los resultados del mapa frecuencias de cada día. Aquí ajusté el case de las letras y removí acentos y espacios para intentar reducir las búsquedas que no encuentren términos. Esto es de lo que creo que más se podría mejorar y sería más útil 😬

Y ya, es todo 🙂