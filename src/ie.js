var app = document.getElementById('app');
app.setAttribute("class", "ie-fallback");

var html = ('<div class="ie-fallback">'
        + '<div class="header">'
            + '<img src="/static/images/pla-estrategic--blue.svg" class="logo-pla" type="image/png"></img>'
            + '<img src="/static/images/logo-vh--blue.png" class="logo-vh" type="image/png"></img>'
        + '</div>'
        + '<div class="main text">'
            + '<h1>Benvingut, Benvinguda</h1>'
            + '<p>Ens agradaria convidar-te a participar en un joc de construcció que només podrem completar si hi participem tots i totes. Es tracta d’un puzle. Tu, com a membre del Vall d’Hebron, tens una peça. La resta de peces són en mans dels teus companys i companyes. Només si tots i totes hi posem la nostra peça aconseguirem descobrir la imatge que s’amaga en el puzle.</p>'
            + '<h3>Juguem?</h3>'
            + '<p>La forma de participar-hi és molt senzilla. Quan cliquis al botó de jugar, t’apareixerà una imatge virtual aèria del campus del Vall d’Hebron. El reconeixeràs de seguida. Al costat veuràs les instruccions del joc i els comandaments o tecles que et permetran moure’t pel campus.</p>'
            + '<p class="enter-btn"><a target="_blank" href="https://youtu.be/qfcquj-DNgs"><button class="button black">VIDEO</button></a></p>'
            + '<img src="/static/images/piece-blue.png" class="piece" />'
        + '</div>'
        + '<div class="footer"></div>'
    + '</div>');

app.innerHTML = html;