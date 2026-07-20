from __future__ import annotations

import shutil
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    CondPageBreak,
    Flowable,
    Image as RLImage,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "downloads"
LOGO = ROOT / "public" / "brand-assets" / "casamia-logo-color-transparent.png"

NAVY = colors.HexColor("#0D1E2E")
NAVY_MID = colors.HexColor("#1B5E8A")
BLUE = colors.HexColor("#3A9FD4")
GREEN = colors.HexColor("#82C341")
PALE_BLUE = colors.HexColor("#EAF6FF")
PALE_GREEN = colors.HexColor("#EEF7E5")
TEXT = colors.HexColor("#24384B")
MUTED = colors.HexColor("#5D7183")
BORDER = colors.HexColor("#C8DCE8")
WHITE = colors.white
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_DISPLAY = "Helvetica-Bold"


def configure_fonts() -> None:
    global FONT_REGULAR, FONT_BOLD, FONT_DISPLAY
    display_pairs = [
        Path(r"C:\Windows\Fonts\georgiab.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"),
        Path("/Library/Fonts/Georgia Bold.ttf"),
    ]
    for display_path in display_pairs:
        if display_path.exists():
            pdfmetrics.registerFont(TTFont("CasaMiaDisplay-Bold", str(display_path)))
            FONT_DISPLAY = "CasaMiaDisplay-Bold"
            break

    font_pairs = [
        (Path(r"C:\Windows\Fonts\arial.ttf"), Path(r"C:\Windows\Fonts\arialbd.ttf")),
        (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"), Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")),
        (Path("/Library/Fonts/Arial.ttf"), Path("/Library/Fonts/Arial Bold.ttf")),
    ]
    for regular_path, bold_path in font_pairs:
        if regular_path.exists() and bold_path.exists():
            pdfmetrics.registerFont(TTFont("CasaMiaSans", str(regular_path)))
            pdfmetrics.registerFont(TTFont("CasaMiaSans-Bold", str(bold_path)))
            FONT_REGULAR = "CasaMiaSans"
            FONT_BOLD = "CasaMiaSans-Bold"
            return


def item(tag: str, en: str, es: str) -> dict[str, str]:
    return {"tag": tag, "en": en, "es": es}


SECTIONS = [
    {
        "title": {"en": "1. Everyday routes throughout the home", "es": "1. Recorridos cotidianos por toda la vivienda"},
        "intro": {
            "en": "Follow the routes used every day before looking at individual products.",
            "es": "Sigue primero los recorridos que se utilizan a diario antes de pensar en productos concretos.",
        },
        "items": [
            item("NOW", "Clear the routes between the bed, bathroom, kitchen, living room and exit.", "Despeja los recorridos entre cama, baño, cocina, salón y salida."),
            item("CHECK", "Confirm the usual walking aid passes without catching furniture or turning sideways.", "Comprueba que la ayuda de marcha habitual pasa sin engancharse ni obligar a girarse de lado."),
            item("FIT", "Note every place where the resident holds a wall or furniture for balance.", "Anota cada lugar donde la persona se apoya en una pared o mueble para mantener el equilibrio."),
            item("NOW", "Remove loose rugs where possible; secure any rug that must remain.", "Retira las alfombras sueltas cuando sea posible y fija bien las que deban permanecer."),
            item("NOW", "Move cables, chargers and extension leads away from walking routes.", "Aleja cables, cargadores y alargadores de las zonas de paso."),
            item("PRO", "Repair loose tiles, curled flooring, damaged boards and unstable transitions.", "Repara baldosas sueltas, suelos levantados, tablas dañadas y transiciones inestables."),
            item("PLAN", "Make lighting even between rooms and remove sudden dark patches.", "Haz que la iluminación sea uniforme entre estancias y elimina zonas oscuras repentinas."),
            item("PLAN", "Reduce glare and confusing reflections from polished floors or mirrors.", "Reduce deslumbramientos y reflejos confusos de suelos pulidos o espejos."),
            item("NOW", "Move frequently used items to a comfortable reach range.", "Coloca los objetos de uso frecuente a una altura cómoda."),
            item("PLAN", "Provide a stable resting seat where long routes or daily tasks require pauses.", "Coloca un asiento estable donde los recorridos largos o las tareas diarias requieran pausas."),
        ],
    },
    {
        "title": {"en": "2. Street-to-door and entrance", "es": "2. Del exterior a la puerta y la entrada"},
        "intro": {
            "en": "Review the full arrival route, including shared areas in apartment buildings.",
            "es": "Revisa todo el recorrido de llegada, incluidas las zonas comunes de los edificios."},
        "items": [
            item("CHECK", "Inspect the route from pavement or parking for broken paving, steep changes and wet-weather slip risk.", "Revisa desde la acera o aparcamiento si hay pavimento roto, desniveles fuertes o riesgo de resbalón con lluvia."),
            item("PRO", "Repair unstable entrance steps and loose or missing handrails.", "Repara escalones inestables y pasamanos sueltos o inexistentes."),
            item("PLAN", "Make step edges and changes in level easy to see without distracting patterns.", "Haz visibles los bordes de los escalones y los cambios de nivel sin crear patrones que distraigan."),
            item("FIT", "Check that any ramp works with the resident's usual mobility aid.", "Comprueba que cualquier rampa funciona con la ayuda de movilidad habitual."),
            item("NOW", "Replace or secure thick, curled or sliding entrance mats.", "Sustituye o fija felpudos gruesos, levantados o deslizantes."),
            item("PLAN", "Review thresholds that catch feet, walkers or wheelchair wheels.", "Revisa los umbrales que enganchan pies, andadores o ruedas de silla."),
            item("FIT", "Confirm the main door can be unlocked, opened and closed without excessive force or twisting.", "Comprueba que la puerta principal se abre y cierra sin fuerza excesiva ni giros difíciles."),
            item("PLAN", "Provide effective lighting at the street entrance, shared hallway and front door.", "Asegura una buena iluminación en la entrada de la calle, portal y puerta de la vivienda."),
            item("CHECK", "Confirm the intercom, bell, lift controls and door viewer suit the resident's vision, hearing and dexterity.", "Comprueba que telefonillo, timbre, ascensor y mirilla se adaptan a la visión, audición y destreza de la persona."),
            item("PLAN", "Agree a secure emergency-access plan with trusted people; do not rely on an exposed hidden key.", "Acuerda un acceso de emergencia seguro con personas de confianza; no dependas de una llave escondida y expuesta."),
        ],
    },
    {
        "title": {"en": "3. Hallways, internal doors and stairs", "es": "3. Pasillos, puertas interiores y escaleras"},
        "intro": {
            "en": "Support and visibility should continue from the first step to the final landing.",
            "es": "El apoyo y la visibilidad deben mantenerse desde el primer escalón hasta el último descansillo."},
        "items": [
            item("NOW", "Keep hallways and landings free from shoes, baskets, tables and decorations.", "Mantén pasillos y descansillos libres de zapatos, cestas, mesas y adornos."),
            item("CHECK", "Check that open doors do not narrow the route or create a collision point.", "Comprueba que las puertas abiertas no estrechan el paso ni crean puntos de choque."),
            item("PLAN", "Review internal thresholds that repeatedly catch a foot or mobility aid.", "Revisa los umbrales interiores que enganchan repetidamente un pie o una ayuda de movilidad."),
            item("PLAN", "Place easy-to-find switches at both ends of long hallways where possible.", "Coloca interruptores fáciles de localizar en ambos extremos de los pasillos largos cuando sea posible."),
            item("PLAN", "Add gentle night lighting along the bedroom-to-bathroom route.", "Añade iluminación nocturna suave en el recorrido del dormitorio al baño."),
            item("NOW", "Keep every stair and landing completely clear.", "Mantén todos los escalones y descansillos completamente despejados."),
            item("PRO", "Check that handrails are secure, easy to grip and continuous for the useful stair length.", "Comprueba que los pasamanos están firmes, son fáciles de agarrar y continúan durante el tramo útil."),
            item("FIT", "Consider support on both sides where the person's movement and the space make it appropriate.", "Valora apoyo a ambos lados cuando el movimiento de la persona y el espacio lo permitan."),
            item("PRO", "Repair uneven or damaged steps and securely fix loose stair coverings.", "Repara peldaños irregulares o dañados y fija bien los revestimientos sueltos."),
            item("PLAN", "Make the first, last and changing step edges easy to distinguish.", "Haz que el primer, último y cualquier escalón diferente sean fáciles de distinguir."),
            item("FIT", "Treat a stairlift as an assessed installation, including transfers, landing space and emergency operation.", "Considera el salvaescaleras una instalación que requiere evaluación, incluidos traslados, espacio y uso de emergencia."),
        ],
    },
    {
        "title": {"en": "4. Living and dining areas", "es": "4. Salón y comedor"},
        "intro": {
            "en": "Arrange the room around real movement, rest and social routines.",
            "es": "Organiza la estancia según los movimientos, descansos y rutinas sociales reales."},
        "items": [
            item("NOW", "Arrange furniture around the routes people use, not only around the television or room shape.", "Organiza los muebles según los recorridos reales, no solo según la televisión o la forma de la sala."),
            item("FIT", "Check that the resident can sit and stand without pulling on a table or unstable object.", "Comprueba que la persona puede sentarse y levantarse sin tirar de una mesa u objeto inestable."),
            item("FIT", "Review seat firmness, height, depth, back support and armrests.", "Revisa firmeza, altura, profundidad, respaldo y apoyabrazos de los asientos."),
            item("CHECK", "Make sure chairs do not slide when weight is placed on them.", "Asegúrate de que las sillas no se deslizan al apoyar peso."),
            item("NOW", "Move low tables, plant stands and sharp corners out of walking routes.", "Retira mesas bajas, maceteros y esquinas afiladas de las zonas de paso."),
            item("NOW", "Secure or remove rugs, trailing throws and loose cables.", "Fija o retira alfombras, mantas colgantes y cables sueltos."),
            item("NOW", "Keep lamps, remotes, telephone, drinks and reading material within comfortable reach.", "Mantén lámparas, mandos, teléfono, bebidas y lectura a un alcance cómodo."),
            item("PLAN", "Provide a clear parking place for a walker, wheelchair or mobility scooter.", "Reserva un lugar claro para andador, silla de ruedas o scooter de movilidad."),
            item("CHECK", "Keep heaters and fans stable, unobstructed and away from loose fabrics.", "Mantén calefactores y ventiladores estables, despejados y lejos de tejidos sueltos."),
        ],
    },
    {
        "title": {"en": "5. Bedroom and night-time route", "es": "5. Dormitorio y recorrido nocturno"},
        "intro": {
            "en": "Test the first movement out of bed and the full route to the bathroom.",
            "es": "Revisa el primer movimiento al salir de la cama y todo el recorrido hasta el baño."},
        "items": [
            item("FIT", "Check that the resident can sit securely on the bed, place both feet down and stand without pulling furniture.", "Comprueba que puede sentarse con seguridad, apoyar ambos pies y levantarse sin tirar de muebles."),
            item("CHECK", "Leave enough clear space for the usual transfer and mobility aid.", "Deja espacio suficiente para el traslado habitual y la ayuda de movilidad."),
            item("NOW", "Keep a stable bedside table within easy reach.", "Mantén una mesilla estable y fácil de alcanzar."),
            item("PLAN", "Provide a light that can be switched on before getting out of bed.", "Instala una luz que pueda encenderse antes de levantarse de la cama."),
            item("PLAN", "Light the full route from bed to bathroom without relying on a handheld phone.", "Ilumina todo el recorrido de la cama al baño sin depender del teléfono."),
            item("NOW", "Keep glasses, mobility aids and secure footwear in the same reachable place every night.", "Deja gafas, ayuda de movilidad y calzado seguro siempre en el mismo lugar accesible."),
            item("NOW", "Remove loose rugs, trailing bedding and charging cables from the bedside route.", "Retira alfombras sueltas, ropa de cama colgante y cables de carga del recorrido."),
            item("PLAN", "Move everyday clothing to storage that avoids climbing or deep bending.", "Coloca la ropa diaria donde no sea necesario subirse ni agacharse mucho."),
            item("PLAN", "Provide a firm chair with arms for dressing when needed.", "Coloca una silla firme con brazos para vestirse cuando sea necesario."),
            item("PRO", "Do not add bed rails or transfer equipment without checking fit, use and possible entrapment risk.", "No añadas barandillas o ayudas de traslado sin revisar ajuste, uso y posible riesgo de atrapamiento."),
        ],
    },
    {
        "title": {"en": "6. Bathroom and toilet", "es": "6. Baño y WC"},
        "intro": {
            "en": "Review the full routine: entry, washing, reaching, drying, toileting and leaving.",
            "es": "Revisa toda la rutina: entrar, lavarse, alcanzar, secarse, usar el WC y salir."},
        "items": [
            item("NOW", "Keep the route, floor and shower exit dry and free of loose objects.", "Mantén recorrido, suelo y salida de la ducha secos y sin objetos sueltos."),
            item("PLAN", "Use a suitable slip-resistant shower or bath surface that remains secure when wet.", "Utiliza una superficie antideslizante adecuada que siga siendo segura mojada."),
            item("NOW", "Stop using towel rails, basin edges, taps or furniture as body-weight support.", "Deja de usar toalleros, lavabo, grifos o muebles como apoyo del peso corporal."),
            item("PRO", "Install permanent grab rails only after checking transfer direction, reach, wall construction and fixing strength.", "Instala barras fijas solo tras revisar dirección del traslado, alcance, pared y resistencia de anclaje."),
            item("FIT", "Review whether the bath or shower step is manageable in both directions.", "Revisa si el borde de bañera o ducha es manejable tanto al entrar como al salir."),
            item("PRO", "Consider a level-access shower when the existing transfer is unsafe or no longer practical.", "Valora una ducha a nivel cuando el traslado actual no sea seguro o práctico."),
            item("FIT", "Check that any shower seat is stable, correctly sized and positioned for controls and washing.", "Comprueba que el asiento de ducha es estable, adecuado y bien colocado respecto a mandos y lavado."),
            item("FIT", "Review toilet height, approach space and support needed for sitting and standing.", "Revisa altura del WC, espacio de aproximación y apoyo necesario al sentarse y levantarse."),
            item("NOW", "Keep towels, toiletries and toilet paper reachable without twisting or stepping on wet flooring.", "Deja toallas, productos y papel accesibles sin girarse ni pisar zonas mojadas."),
            item("CHECK", "Confirm taps and controls can be identified and operated with wet hands.", "Comprueba que grifos y mandos se reconocen y manejan con las manos mojadas."),
            item("PRO", "Review hot-water controls if temperature is difficult to regulate safely.", "Revisa los controles de agua caliente si resulta difícil regular la temperatura con seguridad."),
            item("PLAN", "Use bright, even lighting that avoids glare from mirrors and tiles.", "Utiliza una luz clara y uniforme que evite reflejos de espejos y azulejos."),
            item("CHECK", "Check that the bathroom lock allows assistance in an emergency.", "Comprueba que el cierre del baño permite ayudar en una emergencia."),
            item("PLAN", "Keep an agreed call method reachable from shower, toilet and, where practical, floor level.", "Deja un sistema de aviso accesible desde ducha, WC y, cuando sea posible, desde el suelo."),
        ],
    },
    {
        "title": {"en": "7. Kitchen", "es": "7. Cocina"},
        "intro": {
            "en": "Reduce unnecessary reaching, bending, carrying, turning and time near hot surfaces.",
            "es": "Reduce alcances, flexiones, cargas, giros y tiempo innecesario junto a superficies calientes."},
        "items": [
            item("CHECK", "Confirm the resident can move between storage, preparation, sink and cooking areas.", "Comprueba que puede moverse entre almacenaje, preparación, fregadero y cocción."),
            item("NOW", "Store daily and heavy items within comfortable reach.", "Guarda los objetos diarios y pesados a una altura cómoda."),
            item("NOW", "Stop using chairs, boxes or unstable stools to reach cupboards.", "Deja de usar sillas, cajas o taburetes inestables para alcanzar armarios."),
            item("FIT", "Provide a stable seated preparation option if standing is tiring.", "Ofrece una opción estable para preparar sentado si estar de pie cansa."),
            item("PLAN", "Reduce the need to carry hot or heavy items across the kitchen.", "Reduce la necesidad de transportar objetos calientes o pesados por la cocina."),
            item("PLAN", "Keep a heat-resistant landing surface beside the hob and oven.", "Deja una superficie resistente al calor junto a placa y horno."),
            item("CHECK", "Make cooker controls and on/off indicators easy to see and understand.", "Haz que mandos e indicadores de encendido sean fáciles de ver y comprender."),
            item("NOW", "Position pan handles so they cannot be caught accidentally.", "Coloca los mangos de las sartenes para evitar golpes accidentales."),
            item("FIT", "Check whether kettles, pots and filled containers can be lifted and poured safely.", "Comprueba si hervidores, ollas y recipientes llenos pueden levantarse y verterse con seguridad."),
            item("CHECK", "Ensure appliance doors do not block the resident's standing position or mobility aid.", "Asegura que las puertas de los electrodomésticos no bloquean la postura o ayuda de movilidad."),
            item("NOW", "Clean spills promptly and avoid loose mats near sink and cooking areas.", "Limpia derrames de inmediato y evita alfombrillas sueltas junto a fregadero y cocina."),
            item("PLAN", "Add task lighting over preparation, sink and cooking surfaces.", "Añade iluminación de tarea sobre preparación, fregadero y cocción."),
            item("PRO", "Have gas, electrical, ventilation and water installations reviewed if damaged or difficult to use.", "Solicita revisión de gas, electricidad, ventilación y agua si están dañados o son difíciles de usar."),
        ],
    },
    {
        "title": {"en": "8. Laundry, utility room and storage", "es": "8. Lavandería, cuarto técnico y almacenaje"},
        "intro": {
            "en": "Remove the need to climb, carry heavy loads or bend into awkward spaces.",
            "es": "Elimina la necesidad de subirse, cargar peso o agacharse en espacios incómodos."},
        "items": [
            item("NOW", "Avoid carrying a heavy laundry basket while using stairs or a mobility aid.", "Evita cargar un cesto pesado al usar escaleras o una ayuda de movilidad."),
            item("PLAN", "Use a light basket, trolley or smaller loads where appropriate.", "Utiliza un cesto ligero, carrito o cargas más pequeñas cuando convenga."),
            item("FIT", "Check that appliance doors, drums and controls can be reached without an unstable bend.", "Comprueba que puertas, tambores y mandos se alcanzan sin agacharse de forma inestable."),
            item("NOW", "Store everyday products where they can be seen and reached without climbing.", "Guarda los productos diarios donde puedan verse y alcanzarse sin subirse."),
            item("CHECK", "Keep cleaning products in original containers and away from food and medication.", "Mantén productos de limpieza en sus envases originales y separados de alimentos y medicación."),
            item("PRO", "Repair leaking hoses and arrange appropriate servicing for boilers, heaters, vents and flues.", "Repara mangueras con fugas y revisa calderas, calentadores, ventilación y conductos."),
            item("NOW", "Store ironing equipment safely and avoid trailing hot-appliance cables.", "Guarda bien el equipo de planchado y evita cables sueltos de aparatos calientes."),
            item("PLAN", "Place heavy boxes on stable shelving at a manageable height.", "Coloca cajas pesadas en estanterías firmes y a una altura manejable."),
        ],
    },
    {
        "title": {"en": "9. Balcony, terrace, patio and garden", "es": "9. Balcón, terraza, patio y jardín"},
        "intro": {
            "en": "Review thresholds, wet-weather surfaces, guardrails and the route to seating.",
            "es": "Revisa umbrales, superficies mojadas, barandillas y el recorrido hasta la zona de asiento."},
        "items": [
            item("PLAN", "Review the threshold to the outside area for trips and mobility-aid access.", "Revisa el umbral exterior por tropiezos y paso de ayudas de movilidad."),
            item("PRO", "Repair loose tiles, broken paving and poor drainage.", "Repara baldosas sueltas, pavimento roto y drenaje deficiente."),
            item("NOW", "Stop using any area with a loose or damaged guardrail.", "Deja de usar cualquier zona con una barandilla suelta o dañada."),
            item("NOW", "Keep chairs, planters, hoses and storage boxes out of walking routes.", "Mantén sillas, macetas, mangueras y cajas fuera de las zonas de paso."),
            item("CHECK", "Position furniture so it is not needed as a support point.", "Coloca los muebles para que no se utilicen como punto de apoyo."),
            item("PLAN", "Provide lighting between the door, seating and any steps.", "Ilumina el recorrido entre puerta, asiento y escalones."),
            item("PRO", "Check external steps for stable hand support and visible edges.", "Revisa que los escalones exteriores tengan apoyo firme y bordes visibles."),
            item("FIT", "Check that awnings, shutters and shades can be operated without climbing or overreaching.", "Comprueba que toldos, persianas y sombras se manejan sin subirse ni estirarse demasiado."),
        ],
    },
    {
        "title": {"en": "10. Emergency, electrical and connected safety", "es": "10. Emergencias, electricidad y seguridad conectada"},
        "intro": {
            "en": "Every alert needs an owner, a response routine and a backup for outages.",
            "es": "Cada aviso necesita una persona responsable, una respuesta acordada y un plan ante cortes."},
        "items": [
            item("PLAN", "Install and maintain suitable smoke alarms following current local and manufacturer guidance.", "Instala y mantén detectores de humo adecuados según indicaciones locales y del fabricante."),
            item("PRO", "Consider carbon-monoxide detection where fuel-burning equipment is present.", "Valora detectores de monóxido de carbono cuando haya equipos de combustión."),
            item("CHECK", "Test alarms and record the next test or replacement date.", "Prueba las alarmas y anota la próxima fecha de prueba o sustitución."),
            item("NOW", "Stop using damaged plugs, scorched sockets, exposed wiring and overheating extensions.", "Deja de usar enchufes dañados, tomas quemadas, cables expuestos o alargadores calientes."),
            item("NOW", "Avoid overloaded adaptors and never run power cables beneath rugs.", "Evita adaptadores sobrecargados y nunca pases cables eléctricos bajo alfombras."),
            item("CHECK", "Keep gas and water shut-off points identifiable and accessible to the appropriate person.", "Mantén llaves de gas y agua identificadas y accesibles para la persona adecuada."),
            item("NOW", "Keep 112, the full home address and key contacts clearly available.", "Mantén visibles el 112, la dirección completa y los contactos clave."),
            item("NOW", "Keep a charged telephone or call device reachable in the rooms used most.", "Deja un teléfono cargado o dispositivo de aviso accesible en las estancias más usadas."),
            item("CHECK", "Test tele-assistance, pendant buttons and family alerts where help may be needed.", "Prueba teleasistencia, pulsadores y avisos familiares en los lugares donde podría necesitarse ayuda."),
            item("PLAN", "Agree how trusted responders enter without creating a general security risk.", "Acuerda cómo entran las personas de confianza sin crear un riesgo general de seguridad."),
            item("PLAN", "Create an exit plan that accounts for mobility, hearing, vision, pets and building layout.", "Crea un plan de salida que tenga en cuenta movilidad, audición, visión, mascotas y edificio."),
            item("PLAN", "Plan for power or internet outages if essential devices, lifts or communications depend on them.", "Planifica cortes de luz o internet si dispositivos, ascensor o comunicaciones dependen de ellos."),
        ],
    },
]


SECTION_VISUALS = [
    {
        "diagram": "routes",
        "title": {"en": "Start with the daily path", "es": "Empieza por el recorrido diario"},
        "cues": [
            {"en": "Bed to bathroom", "es": "Cama a baño"},
            {"en": "Kitchen to living area", "es": "Cocina a salón"},
            {"en": "Exit route", "es": "Ruta de salida"},
        ],
    },
    {
        "diagram": "entrance",
        "title": {"en": "Arrival route visual check", "es": "Revisión visual de la llegada"},
        "cues": [
            {"en": "Thresholds", "es": "Umbrales"},
            {"en": "Mats and steps", "es": "Felpudos y escalones"},
            {"en": "Door lighting", "es": "Luz en la puerta"},
        ],
    },
    {
        "diagram": "stairs",
        "title": {"en": "Support must continue", "es": "El apoyo debe continuar"},
        "cues": [
            {"en": "Both ends of routes", "es": "Ambos extremos"},
            {"en": "Handrail grip", "es": "Agarre del pasamanos"},
            {"en": "Step edges", "es": "Bordes de escalón"},
        ],
    },
    {
        "diagram": "living",
        "title": {"en": "Clear the room around real movement", "es": "Ordena la estancia según el movimiento real"},
        "cues": [
            {"en": "Seat height", "es": "Altura del asiento"},
            {"en": "Low tables", "es": "Mesas bajas"},
            {"en": "Cable routes", "es": "Cables"},
        ],
    },
    {
        "diagram": "bedroom",
        "title": {"en": "Test the first step out of bed", "es": "Revisa el primer paso al levantarse"},
        "cues": [
            {"en": "Bedside light", "es": "Luz junto a la cama"},
            {"en": "Clear floor", "es": "Suelo despejado"},
            {"en": "Night route", "es": "Ruta nocturna"},
        ],
    },
    {
        "diagram": "bathroom",
        "title": {"en": "Bathrooms need fixed support, not improvisation", "es": "El baño necesita apoyo fijo, no improvisado"},
        "cues": [
            {"en": "Wet floor", "es": "Suelo mojado"},
            {"en": "Grab points", "es": "Puntos de apoyo"},
            {"en": "Toilet transfer", "es": "Traslado al WC"},
        ],
    },
    {
        "diagram": "kitchen",
        "title": {"en": "Reduce reach, heat and carrying", "es": "Reduce alcance, calor y cargas"},
        "cues": [
            {"en": "Daily storage", "es": "Almacenaje diario"},
            {"en": "Hot surfaces", "es": "Superficies calientes"},
            {"en": "Spills", "es": "Derrames"},
        ],
    },
    {
        "diagram": "utility",
        "title": {"en": "Make heavy tasks smaller", "es": "Haz las tareas pesadas más pequeñas"},
        "cues": [
            {"en": "Laundry loads", "es": "Cargas de ropa"},
            {"en": "Reach height", "es": "Altura de alcance"},
            {"en": "Leaking hoses", "es": "Mangueras con fuga"},
        ],
    },
    {
        "diagram": "exterior",
        "title": {"en": "Outside areas change with weather", "es": "El exterior cambia con el clima"},
        "cues": [
            {"en": "Wet surfaces", "es": "Superficies mojadas"},
            {"en": "Guardrails", "es": "Barandillas"},
            {"en": "Outdoor lighting", "es": "Luz exterior"},
        ],
    },
    {
        "diagram": "alerts",
        "title": {"en": "Every alert needs a response plan", "es": "Cada aviso necesita un plan de respuesta"},
        "cues": [
            {"en": "Alarm owner", "es": "Responsable del aviso"},
            {"en": "112 visible", "es": "112 visible"},
            {"en": "Power backup", "es": "Plan ante cortes"},
        ],
    },
]


SECTION_HELPER = {
    "en": "Walk the space, tick what applies, then use the priority label to decide what can be done today and what needs review.",
    "es": "Recorre el espacio, marca lo que aplique y usa la prioridad para decidir qué hacer hoy y qué revisar.",
}

PHOTO_PROMPTS = {
    "routes": {
        "en": ["Main walking route", "Any rug or cable", "Tight turning point", "Route after dark"],
        "es": ["Ruta principal", "Alfombra o cable", "Punto de giro estrecho", "Ruta de noche"],
    },
    "entrance": {
        "en": ["Outside approach", "Threshold close-up", "Door lock and handle", "Lighting at night"],
        "es": ["Llegada exterior", "Detalle del umbral", "Cerradura y manilla", "Luz de noche"],
    },
    "stairs": {
        "en": ["Whole staircase", "First and last step", "Handrail fixing", "Step edge visibility"],
        "es": ["Escalera completa", "Primer y último escalón", "Fijación del pasamanos", "Bordes visibles"],
    },
    "living": {
        "en": ["Seat used most", "Route around furniture", "Low tables or cables", "Items used daily"],
        "es": ["Asiento habitual", "Paso entre muebles", "Mesas bajas o cables", "Objetos diarios"],
    },
    "bedroom": {
        "en": ["Bedside area", "First step from bed", "Night route to bathroom", "Light switch reach"],
        "es": ["Zona junto a cama", "Primer paso al levantarse", "Ruta nocturna al baño", "Alcance de la luz"],
    },
    "bathroom": {
        "en": ["Shower or bath exit", "Toilet transfer area", "Current support points", "Wet floor zones"],
        "es": ["Salida de ducha o bañera", "Zona de traslado al WC", "Puntos de apoyo actuales", "Zonas mojadas"],
    },
    "kitchen": {
        "en": ["Worktop and sink", "Daily storage height", "Cooking controls", "Anything used to climb"],
        "es": ["Encimera y fregadero", "Altura de uso diario", "Mandos de cocción", "Cualquier cosa para subirse"],
    },
    "utility": {
        "en": ["Laundry route", "Appliance access", "High storage", "Hoses or damp areas"],
        "es": ["Ruta de colada", "Acceso a electrodomésticos", "Almacenaje alto", "Mangueras o humedad"],
    },
    "exterior": {
        "en": ["Path to entrance", "Outdoor steps", "Rails or walls used", "Wet or uneven surface"],
        "es": ["Camino a la entrada", "Escalones exteriores", "Barandillas o paredes usadas", "Suelo mojado o irregular"],
    },
    "alerts": {
        "en": ["Alarm/button location", "Emergency contacts display", "Phone charging place", "Power or router area"],
        "es": ["Ubicación del botón/alarma", "Contactos de emergencia", "Lugar de carga del teléfono", "Zona de luz o router"],
    },
}


COPY = {
    "en": {
        "file": "casamia-complete-senior-home-conversion-checklist-en.pdf",
        "title": "The Complete Senior Home Conversion Checklist",
        "subtitle": "A practical room-by-room workbook for safer, easier ageing at home in Spain.",
        "cover_label": "CASAMIA PRACTICAL GUIDE",
        "cover_note": "Walk the home. Mark priorities. Build a clear plan.",
        "cover_meta": ["10 home areas", "100+ practical checks", "Action-plan worksheet"],
        "how_title": "How to use this workbook",
        "how_intro": "Complete the checklist with the person who lives in the home. Their routines, preferences and independence matter as much as the building.",
        "steps": [
            "Walk through the home during the day and after dark.",
            "Use the shoes and mobility aid normally used at home.",
            "Observe normal routines; never ask anyone to demonstrate an unsafe movement.",
            "Mark each item, photograph concerns and record useful measurements.",
            "Move every concern into the action plan with an owner and date.",
            "Recheck after a fall, near miss, hospital stay or meaningful change in mobility, vision, hearing or memory.",
        ],
        "priority_title": "Priority guide",
        "priority": {
            "NOW": ("DO NOW", "A simple change or an unsafe item to stop using today."),
            "CHECK": ("CHECK", "Observe, test or record the current condition."),
            "PLAN": ("PLAN", "Set an owner, target date and budget or quotation."),
            "PRO": ("PRO REVIEW", "Needs an appropriately qualified professional."),
            "FIT": ("PERSONAL FIT", "The right solution depends on the resident and routine."),
        },
        "profile_title": "Resident and home snapshot",
        "profile_fields": ["Resident name", "Home address", "Date reviewed", "Reviewed with", "Mobility aid used", "Main concern today"],
        "safety_note": "This workbook is a planning aid, not a building inspection or medical assessment. Fixed supports, structural alterations, electrical, gas and plumbing work should be reviewed and completed by appropriately qualified professionals. In an immediate emergency in Spain, call 112.",
        "quick_wins_title": "10 quick wins to do before buying anything",
        "quick_wins_intro": "Start with the changes that reduce daily risk immediately. Most take minutes, cost little or nothing, and make the professional conversation clearer.",
        "quick_wins": [
            "Clear the route from bed to bathroom and from living room to exit.",
            "Remove loose rugs or fix the edges so they cannot curl or slide.",
            "Move chargers, extension leads and cables away from walking routes.",
            "Place a light switch, lamp or motion light before the first step out of bed.",
            "Keep shoes, glasses, walking aid and phone in the same reachable place.",
            "Stop using towel rails, sink edges or furniture as body-weight support.",
            "Put heavy daily items between hip and shoulder height.",
            "Turn pan handles inward and keep hot/heavy items close to the worktop.",
            "Make 112 and key contacts visible near the phone.",
            "Agree who responds first if there is an alert, fall, power cut or missed call.",
        ],
        "photo_prompt_title": "Photos to take",
        "photo_prompt_intro": "Useful photos before asking for help:",
        "section_notes": "Notes, measurements or photo numbers",
        "plan_title": "Family action plan",
        "plan_intro": "Choose the five changes that will make the biggest difference to daily safety, independence or confidence.",
        "resident_question": "The activity the resident most wants to keep doing independently:",
        "hardest_question": "The room or routine that feels hardest today:",
        "recent_question": "What has changed recently?",
        "decision_question": "Who should be involved in decisions?",
        "plan_headers": ["Room / route", "What is happening?", "Temporary step", "Preferred solution", "Owner / date"],
        "quote_title": "Before requesting quotations",
        "quote_items": [
            "Photograph the current area and record the normal routine and mobility aid used.",
            "Describe the outcome required, not only a product name.",
            "Ask who will complete and supervise the work.",
            "Request written scope, price, exclusions, timing and payment stages.",
            "Confirm installation, testing, handover and warranty arrangements.",
            "Check whether owner, landlord, community or local-authority approval may be needed.",
            "Check current local funding rules before work starts; availability and eligibility can change.",
            "Keep quotations, invoices, approvals and before-and-after photographs together.",
        ],
        "handover_title": "Handover and recheck",
        "handover_items": [
            "The resident has tried the finished change during the real routine.",
            "Controls and emergency functions have been explained.",
            "Family or carers know how the solution should be used.",
            "The route remains clear after furniture and belongings are returned.",
            "Alarms and connected alerts reach the agreed person.",
            "Product information, installer details and a recheck date are stored safely.",
        ],
        "sources_title": "Safety note and reference sources",
        "sources_intro": "This workbook combines CasaMia planning content with official home-safety and accessibility guidance. It avoids generic dimensions because the right solution depends on the person, property and current technical requirements.",
        "sources": [
            "Spanish Ministry of Health - General fall-prevention recommendations at home (March 2026): sanidad.gob.es/areas/promocionPrevencion/envejecimientoSaludable/fragilidadCaidas/",
            "CEAPAT / Imserso - Accessible kitchen guidance (September 2022): ceapat.imserso.es",
            "Comunidad de Madrid - Home prevention and emergency guidance: comunidad.madrid/seguridad-emergencias-asem-112/prevencion-hogar",
            "CDC STEADI - Check for Safety home fall-prevention checklist: cdc.gov/steadi/",
        ],
        "footer_title": "Complete Senior Home Conversion Checklist",
    },
    "es": {
        "file": "casamia-lista-completa-adaptacion-vivienda-personas-mayores-es.pdf",
        "title": "Lista completa para adaptar la vivienda de una persona mayor",
        "subtitle": "Un cuaderno práctico, estancia por estancia, para envejecer en casa con más seguridad y facilidad en España.",
        "cover_label": "GUÍA PRÁCTICA CASAMIA",
        "cover_note": "Recorre la vivienda. Marca prioridades. Crea un plan claro.",
        "cover_meta": ["10 zonas del hogar", "Más de 100 comprobaciones", "Hoja de planificación"],
        "how_title": "Cómo utilizar este cuaderno",
        "how_intro": "Completa la lista con la persona que vive en el hogar. Sus rutinas, preferencias y autonomía importan tanto como el edificio.",
        "steps": [
            "Recorre la vivienda durante el día y después de anochecer.",
            "Utiliza el calzado y la ayuda de movilidad habituales en casa.",
            "Observa rutinas normales; nunca pidas a nadie que demuestre un movimiento peligroso.",
            "Marca cada punto, fotografía las dudas y anota medidas útiles.",
            "Pasa cada preocupación al plan de acción con responsable y fecha.",
            "Revisa de nuevo tras una caída, susto, hospitalización o cambio relevante de movilidad, visión, audición o memoria.",
        ],
        "priority_title": "Guía de prioridades",
        "priority": {
            "NOW": ("HACER HOY", "Cambio sencillo o elemento peligroso que debe dejar de usarse hoy."),
            "CHECK": ("COMPROBAR", "Observar, probar o registrar el estado actual."),
            "PLAN": ("PLANIFICAR", "Asignar responsable, fecha y presupuesto estimado o solicitar un presupuesto profesional."),
            "PRO": ("PROFESIONAL", "Necesita una persona profesional debidamente cualificada."),
            "FIT": ("AJUSTE PERSONAL", "La solución depende de la persona y su rutina."),
        },
        "profile_title": "Resumen de la persona y la vivienda",
        "profile_fields": ["Nombre", "Dirección", "Fecha de revisión", "Revisado con", "Ayuda de movilidad", "Principal preocupación"],
        "safety_note": "Este cuaderno sirve para planificar; no sustituye una inspección técnica ni una evaluación médica. Los apoyos fijos, cambios estructurales y trabajos de electricidad, gas o fontanería deben ser revisados y realizados por profesionales adecuados. En una emergencia inmediata en España, llama al 112.",
        "quick_wins_title": "10 mejoras rápidas antes de comprar nada",
        "quick_wins_intro": "Empieza por los cambios que reducen el riesgo diario de inmediato. La mayoría se hacen en minutos, cuestan poco o nada y ayudan a explicar mejor la situación a un profesional.",
        "quick_wins": [
            "Despeja la ruta de cama a baño y de salón a salida.",
            "Retira alfombras sueltas o fija los bordes para que no se levanten ni deslicen.",
            "Aleja cargadores, alargadores y cables de las zonas de paso.",
            "Coloca una luz, interruptor o sensor antes del primer paso al levantarse.",
            "Deja calzado, gafas, ayuda de movilidad y teléfono siempre al alcance.",
            "Deja de usar toalleros, lavabo o muebles como apoyo del peso corporal.",
            "Coloca los objetos diarios pesados entre altura de cadera y hombro.",
            "Gira los mangos de sartenes hacia dentro y acerca objetos calientes o pesados.",
            "Haz visible el 112 y los contactos clave junto al teléfono.",
            "Acuerda quién responde primero ante un aviso, caída, corte de luz o llamada perdida.",
        ],
        "photo_prompt_title": "Fotos útiles",
        "photo_prompt_intro": "Antes de pedir ayuda, fotografía:",
        "section_notes": "Notas, medidas o números de foto",
        "plan_title": "Plan de acción familiar",
        "plan_intro": "Elige los cinco cambios que más mejorarán la seguridad, autonomía o confianza diaria.",
        "resident_question": "La actividad que la persona más quiere seguir haciendo con autonomía:",
        "hardest_question": "La estancia o rutina que resulta más difícil hoy:",
        "recent_question": "¿Qué ha cambiado recientemente?",
        "decision_question": "¿Quién debe participar en las decisiones?",
        "plan_headers": ["Estancia / ruta", "¿Qué ocurre?", "Medida temporal", "Solución preferida", "Responsable / fecha"],
        "quote_title": "Antes de pedir presupuestos",
        "quote_items": [
            "Fotografía la zona actual y anota la rutina y ayuda de movilidad utilizadas.",
            "Describe el resultado necesario, no solo el nombre de un producto.",
            "Pregunta quién realizará y supervisará el trabajo.",
            "Solicita por escrito alcance, precio, exclusiones, plazo y fases de pago.",
            "Confirma instalación, pruebas, entrega y garantía.",
            "Comprueba si hace falta autorización del propietario, comunidad o administración.",
            "Revisa las ayudas locales vigentes antes de empezar; disponibilidad y requisitos pueden cambiar.",
            "Guarda juntos presupuestos, facturas, permisos y fotos de antes y después.",
        ],
        "handover_title": "Entrega y revisión",
        "handover_items": [
            "La persona ha probado el cambio durante la rutina real.",
            "Se han explicado mandos y funciones de emergencia.",
            "Familia o cuidadores saben cómo utilizar la solución.",
            "El recorrido sigue despejado al devolver muebles y objetos.",
            "Las alarmas y avisos conectados llegan a la persona acordada.",
            "La información del producto, instalador y fecha de revisión está guardada.",
        ],
        "sources_title": "Nota de seguridad y fuentes de referencia",
        "sources_intro": "Este cuaderno combina contenido de planificación de CasaMia con orientación oficial sobre seguridad y accesibilidad. Evita medidas genéricas porque la solución correcta depende de la persona, la vivienda y los requisitos técnicos vigentes.",
        "sources": [
            "Ministerio de Sanidad - Recomendaciones generales para prevenir caídas en el hogar (marzo de 2026): sanidad.gob.es/areas/promocionPrevencion/envejecimientoSaludable/fragilidadCaidas/",
            "CEAPAT / Imserso - Orientación para una cocina accesible (septiembre de 2022): ceapat.imserso.es",
            "Comunidad de Madrid - Prevención y emergencias en el hogar: comunidad.madrid/seguridad-emergencias-asem-112/prevencion-hogar",
            "CDC STEADI - Lista de prevención de caídas en el hogar: cdc.gov/steadi/",
        ],
        "footer_title": "Lista completa para adaptar la vivienda",
    },
}


def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "cover_label": ParagraphStyle(
            "cover_label", parent=base["Normal"], fontName=FONT_BOLD, fontSize=9,
            leading=12, textColor=NAVY_MID, spaceAfter=14, tracking=1.2,
        ),
        "cover_title": ParagraphStyle(
            "cover_title", parent=base["Title"], fontName=FONT_DISPLAY, fontSize=38,
            leading=40, textColor=NAVY, alignment=TA_LEFT, spaceAfter=13,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=14,
            leading=20, textColor=TEXT, spaceAfter=14,
        ),
        "cover_note": ParagraphStyle(
            "cover_note", parent=base["Normal"], fontName=FONT_BOLD, fontSize=11,
            leading=15, textColor=NAVY_MID,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta", parent=base["Normal"], fontName=FONT_BOLD, fontSize=8.7,
            leading=11.5, textColor=NAVY,
        ),
        "h1": ParagraphStyle(
            "h1", parent=base["Heading1"], fontName=FONT_BOLD, fontSize=24,
            leading=28, textColor=NAVY, spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontName=FONT_BOLD, fontSize=15,
            leading=19, textColor=NAVY, spaceBefore=7, spaceAfter=7,
        ),
        "intro": ParagraphStyle(
            "intro", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=10.5,
            leading=15, textColor=MUTED, spaceAfter=12,
        ),
        "section_helper": ParagraphStyle(
            "section_helper", parent=base["Normal"], fontName=FONT_BOLD, fontSize=9.4,
            leading=12.4, textColor=NAVY_MID, spaceBefore=3, spaceAfter=6,
        ),
        "visual_title": ParagraphStyle(
            "visual_title", parent=base["Normal"], fontName=FONT_BOLD, fontSize=12.5,
            leading=15.5, textColor=NAVY, spaceAfter=6,
        ),
        "visual_cue": ParagraphStyle(
            "visual_cue", parent=base["Normal"], fontName=FONT_BOLD, fontSize=8.9,
            leading=11.2, textColor=NAVY,
        ),
        "visual_label": ParagraphStyle(
            "visual_label", parent=base["Normal"], fontName=FONT_BOLD, fontSize=7.4,
            leading=9, textColor=BLUE, alignment=TA_CENTER,
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=10.2,
            leading=14.6, textColor=TEXT,
        ),
        "body_small": ParagraphStyle(
            "body_small", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=8.9,
            leading=12, textColor=TEXT,
        ),
        "small": ParagraphStyle(
            "small", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=7.5,
            leading=10, textColor=MUTED,
        ),
        "tag": ParagraphStyle(
            "tag", parent=base["Normal"], fontName=FONT_BOLD, fontSize=7.1,
            leading=8.6, textColor=WHITE, alignment=TA_CENTER,
        ),
        "check": ParagraphStyle(
            "check", parent=base["Normal"], fontName=FONT_BOLD, fontSize=14,
            leading=16, textColor=NAVY, alignment=TA_CENTER,
        ),
        "field": ParagraphStyle(
            "field", parent=base["Normal"], fontName=FONT_BOLD, fontSize=8.3,
            leading=11, textColor=NAVY,
        ),
        "table_header": ParagraphStyle(
            "table_header", parent=base["Normal"], fontName=FONT_BOLD, fontSize=7.3,
            leading=9, textColor=WHITE, alignment=TA_LEFT,
        ),
        "source": ParagraphStyle(
            "source", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=7.4,
            leading=10.2, textColor=MUTED,
        ),
    }


TAG_COLOURS = {
    "NOW": GREEN,
    "CHECK": BLUE,
    "PLAN": NAVY_MID,
    "PRO": colors.HexColor("#B45A3C"),
    "FIT": colors.HexColor("#6D5CB5"),
}


def draw_cover(canvas, doc) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#F7FBFE"))
    canvas.rect(0, 0, width, height, stroke=0, fill=1)

    canvas.setFillColor(colors.Color(0.22, 0.62, 0.83, alpha=0.13))
    canvas.circle(width + 8 * mm, height - 8 * mm, 62 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.Color(0.51, 0.76, 0.25, alpha=0.10))
    canvas.circle(width - 24 * mm, height - 40 * mm, 34 * mm, stroke=0, fill=1)

    canvas.setFillColor(BLUE)
    canvas.rect(18 * mm, 31 * mm, 34 * mm, 2.2 * mm, stroke=0, fill=1)
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.7)
    canvas.line(18 * mm, 28 * mm, width - 18 * mm, 28 * mm)

    canvas.setFillColor(NAVY)
    canvas.setFont(FONT_BOLD, 8)
    canvas.drawString(18 * mm, 17 * mm, "casamia.com.es")
    canvas.restoreState()


def draw_body_page(canvas, doc, copy) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, height - 17 * mm, width - 18 * mm, height - 17 * mm)
    canvas.setFont(FONT_BOLD, 7.5)
    canvas.setFillColor(NAVY)
    canvas.drawString(18 * mm, height - 13 * mm, "CasaMia")
    canvas.setFont(FONT_REGULAR, 7)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(width - 18 * mm, height - 13 * mm, copy["footer_title"])
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFont(FONT_REGULAR, 7)
    canvas.drawString(18 * mm, 9 * mm, "casamia.com.es")
    canvas.drawRightString(width - 18 * mm, 9 * mm, str(doc.page))
    canvas.restoreState()


class GuideDiagram(Flowable):
    def __init__(self, diagram_type: str, language: str, width: float = 158 * mm, height: float = 66 * mm):
        super().__init__()
        self.diagram_type = diagram_type
        self.language = language
        self.width = width
        self.height = height

    def draw(self) -> None:
        c = self.canv
        w = self.width
        h = self.height
        c.saveState()
        specs = self._action_specs().get(self.diagram_type, self._action_specs()["routes"])
        gap = 4 * mm
        card_w = (w - 2 * gap) / 3
        for index, spec in enumerate(specs):
            x = index * (card_w + gap)
            self._draw_action_card(c, x, 0, card_w, h, spec)
        c.restoreState()

    def _t(self, en: str, es: str) -> str:
        return es if self.language == "es" else en

    def _action_specs(self) -> dict[str, list[dict[str, str]]]:
        return {
            "routes": [
                {"icon": "rug", "kind": "risk", "tag": self._t("REMOVE", "RETIRAR"), "title": self._t("Loose rugs", "Alfombras sueltas"), "action": self._t("Fix or remove before walking routes.", "Fijar o quitar de las rutas.")},
                {"icon": "cable", "kind": "risk", "tag": self._t("MOVE", "MOVER"), "title": self._t("Cables in the path", "Cables en el paso"), "action": self._t("Keep chargers and leads off the floor.", "Sacar cargadores y cables del suelo.")},
                {"icon": "walker", "kind": "check", "tag": self._t("TEST", "PROBAR"), "title": self._t("Walker clearance", "Paso con andador"), "action": self._t("Walk the real route with the usual aid.", "Probar la ruta con la ayuda habitual.")},
            ],
            "entrance": [
                {"icon": "threshold", "kind": "risk", "tag": self._t("CHECK", "REVISAR"), "title": self._t("Raised threshold", "Umbral elevado"), "action": self._t("Mark, repair or ramp difficult edges.", "Señalar, reparar o salvar bordes.")},
                {"icon": "door", "kind": "check", "tag": self._t("TEST", "PROBAR"), "title": self._t("Door effort", "Esfuerzo de puerta"), "action": self._t("Open with the usual keys and hands.", "Abrir con llaves y manos reales.")},
                {"icon": "light", "kind": "fix", "tag": self._t("ADD", "AÑADIR"), "title": self._t("Visible arrival", "Llegada visible"), "action": self._t("Light the portal, lock and first step.", "Iluminar portal, cerradura y primer paso.")},
            ],
            "stairs": [
                {"icon": "rail", "kind": "fix", "tag": self._t("ADD", "AÑADIR"), "title": self._t("Continuous rail", "Pasamanos continuo"), "action": self._t("Support should run past first and last step.", "Debe cubrir primer y último escalón.")},
                {"icon": "step_edges", "kind": "check", "tag": self._t("MARK", "MARCAR"), "title": self._t("Step edges", "Bordes de escalón"), "action": self._t("Make edges visible in low light.", "Hacerlos visibles con poca luz.")},
                {"icon": "stairs_clutter", "kind": "risk", "tag": self._t("CLEAR", "DESPEJAR"), "title": self._t("Nothing stored", "Nada guardado"), "action": self._t("No shoes, baskets or parcels on stairs.", "Sin zapatos, cestas ni paquetes.")},
            ],
            "living": [
                {"icon": "chair", "kind": "check", "tag": self._t("TEST", "PROBAR"), "title": self._t("Safe chair height", "Altura de silla"), "action": self._t("Sit and stand without pulling furniture.", "Sentarse sin tirar de muebles.")},
                {"icon": "low_table", "kind": "risk", "tag": self._t("MOVE", "MOVER"), "title": self._t("Low tables", "Mesas bajas"), "action": self._t("Open a clear turning path.", "Abrir espacio para girar.")},
                {"icon": "remote", "kind": "fix", "tag": self._t("PLACE", "COLOCAR"), "title": self._t("Daily items close", "Uso diario cerca"), "action": self._t("Phone, glasses and water within reach.", "Teléfono, gafas y agua al alcance.")},
            ],
            "bedroom": [
                {"icon": "bed", "kind": "check", "tag": self._t("TEST", "PROBAR"), "title": self._t("First stand-up", "Primer levantarse"), "action": self._t("Feet flat, no pulling on drawers.", "Pies firmes, sin tirar de cajones.")},
                {"icon": "lamp", "kind": "fix", "tag": self._t("ADD", "AÑADIR"), "title": self._t("Light before standing", "Luz antes de ponerse de pie"), "action": self._t("Switch reachable from bed.", "Interruptor al alcance desde cama.")},
                {"icon": "shoes", "kind": "risk", "tag": self._t("SET", "PREPARAR"), "title": self._t("Night route kit", "Ruta nocturna"), "action": self._t("Shoes, glasses and aid in one place.", "Calzado, gafas y ayuda juntos.")},
            ],
            "bathroom": [
                {"icon": "wet_floor", "kind": "risk", "tag": self._t("DRY", "SECAR"), "title": self._t("Wet floor", "Suelo mojado"), "action": self._t("Dry exit from shower before walking.", "Secar salida de ducha antes de caminar.")},
                {"icon": "grab_bar", "kind": "fix", "tag": self._t("FIX", "FIJAR"), "title": self._t("Real grab bars", "Barras reales"), "action": self._t("Never rely on towel rails or sink edges.", "No usar toalleros ni lavabo como apoyo.")},
                {"icon": "toilet", "kind": "check", "tag": self._t("TEST", "PROBAR"), "title": self._t("Toilet transfer", "Traslado al WC"), "action": self._t("Check height, approach and support.", "Revisar altura, acceso y apoyo.")},
            ],
            "kitchen": [
                {"icon": "shelf", "kind": "fix", "tag": self._t("LOWER", "BAJAR"), "title": self._t("Daily items", "Uso diario"), "action": self._t("Heavy items between shoulder and hip.", "Peso entre hombro y cadera.")},
                {"icon": "stool", "kind": "risk", "tag": self._t("STOP", "EVITAR"), "title": self._t("No stools", "Sin taburetes"), "action": self._t("Avoid climbing for cupboards.", "No subirse para alcanzar armarios.")},
                {"icon": "pan", "kind": "check", "tag": self._t("TURN", "GIRAR"), "title": self._t("Pan handles", "Mangos de sartén"), "action": self._t("Turn handles inward to avoid knocks.", "Girarlos hacia dentro.")},
            ],
            "utility": [
                {"icon": "laundry", "kind": "check", "tag": self._t("SPLIT", "DIVIDIR"), "title": self._t("Small loads", "Cargas pequeñas"), "action": self._t("Carry less, more often.", "Llevar menos peso cada vez.")},
                {"icon": "shelf", "kind": "risk", "tag": self._t("LOWER", "BAJAR"), "title": self._t("Reach height", "Altura de alcance"), "action": self._t("No stretching with weight.", "No estirarse con peso.")},
                {"icon": "leak", "kind": "fix", "tag": self._t("CHECK", "REVISAR"), "title": self._t("Leaks and hoses", "Fugas y mangueras"), "action": self._t("Check before damage becomes a fall risk.", "Revisar antes de que sea riesgo.")},
            ],
            "exterior": [
                {"icon": "rain_path", "kind": "risk", "tag": self._t("WATCH", "VIGILAR"), "title": self._t("Wet surfaces", "Superficies mojadas"), "action": self._t("Weather changes grip quickly.", "El clima cambia el agarre.")},
                {"icon": "rail", "kind": "check", "tag": self._t("TEST", "PROBAR"), "title": self._t("Loose rail", "Barandilla floja"), "action": self._t("Do not use if it moves.", "No usar si se mueve.")},
                {"icon": "light", "kind": "fix", "tag": self._t("LIGHT", "ILUMINAR"), "title": self._t("Path to door", "Camino a puerta"), "action": self._t("Light from gate or car to entrance.", "Luz desde portal o coche.")},
            ],
            "alerts": [
                {"icon": "button", "kind": "check", "tag": self._t("REACH", "ALCANCE"), "title": self._t("Call button", "Botón de aviso"), "action": self._t("Reachable from bed, bath and floor.", "Al alcance en cama, baño y suelo.")},
                {"icon": "phone112", "kind": "fix", "tag": self._t("VISIBLE", "VISIBLE"), "title": self._t("Emergency number", "Emergencia"), "action": self._t("112 and contacts easy to find.", "112 y contactos fáciles de ver.")},
                {"icon": "response", "kind": "risk", "tag": self._t("AGREE", "ACORDAR"), "title": self._t("Who responds?", "Quién responde"), "action": self._t("Name the person, backup and next step.", "Persona, suplente y siguiente paso.")},
            ],
        }

    def _draw_action_card(self, c, x: float, y: float, w: float, h: float, spec: dict[str, str]) -> None:
        palette = {
            "risk": (colors.HexColor("#FFF0E8"), colors.HexColor("#C85F3E")),
            "fix": (colors.HexColor("#EEF7E5"), colors.HexColor("#6FAE33")),
            "check": (colors.HexColor("#EAF6FF"), NAVY_MID),
        }
        fill, ink = palette[spec["kind"]]
        c.setFillColor(WHITE)
        c.roundRect(x, y, w, h, 8, stroke=0, fill=1)
        c.setFillColor(fill)
        c.roundRect(x, y + h - 13 * mm, w, 13 * mm, 8, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.rect(x, y + h - 13 * mm, w, 5 * mm, stroke=0, fill=1)
        c.setStrokeColor(colors.HexColor("#BEDBEA"))
        c.setLineWidth(0.8)
        c.roundRect(x, y, w, h, 8, stroke=1, fill=0)
        c.setFillColor(WHITE)
        c.roundRect(x + 5 * mm, y + h - 10.5 * mm, 24 * mm, 6.8 * mm, 3.4, stroke=0, fill=1)
        c.setFillColor(ink)
        c.setFont(FONT_BOLD, 6.5)
        c.drawCentredString(x + 17 * mm, y + h - 8.1 * mm, spec["tag"])
        c.setStrokeColor(ink)
        c.setLineWidth(1.1)
        c.line(x + 5 * mm, y + h - 15 * mm, x + w - 5 * mm, y + h - 15 * mm)
        self._draw_icon(c, spec["icon"], x + w * 0.5, y + h * 0.56, min(w * 0.58, h * 0.38), ink, spec["kind"])
        c.setFillColor(NAVY)
        c.setFont(FONT_BOLD, 8.7)
        c.drawCentredString(x + w / 2, y + 17.2 * mm, spec["title"][:30])
        c.setFillColor(MUTED)
        c.setFont(FONT_REGULAR, 6.6)
        lines = self._wrap(spec["action"], 31)
        for idx, line in enumerate(lines[:3]):
            c.drawCentredString(x + w / 2, y + (11.0 - idx * 3.5) * mm, line)
        c.setStrokeColor(ink)
        c.setLineWidth(1.6)
        c.line(x + 12 * mm, y + 4 * mm, x + w - 12 * mm, y + 4 * mm)

    def _wrap(self, text: str, width: int) -> list[str]:
        words = text.split()
        lines: list[str] = []
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if len(candidate) <= width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    def _draw_icon(self, c, icon: str, cx: float, cy: float, size: float, ink, kind: str) -> None:
        c.saveState()
        c.setStrokeColor(ink)
        icon_fill = {
            "risk": colors.Color(200 / 255, 95 / 255, 62 / 255, alpha=0.08),
            "fix": colors.Color(111 / 255, 174 / 255, 51 / 255, alpha=0.10),
            "check": colors.Color(58 / 255, 159 / 255, 212 / 255, alpha=0.10),
        }[kind]
        c.setFillColor(icon_fill)
        c.circle(cx, cy, size * 0.54, stroke=0, fill=1)
        c.setStrokeColor(colors.Color(1, 1, 1, alpha=0.65))
        c.setLineWidth(5)
        c.circle(cx, cy, size * 0.54, stroke=1, fill=0)
        c.setStrokeColor(ink)
        c.setLineWidth(2.2)
        s = size
        if icon == "rug":
            c.roundRect(cx - s * 0.36, cy - s * 0.16, s * 0.72, s * 0.32, 5, stroke=1, fill=0)
            c.line(cx - s * 0.28, cy - s * 0.05, cx + s * 0.28, cy - s * 0.05)
            c.setStrokeColor(colors.HexColor("#C85F3E"))
            c.line(cx - s * 0.35, cy - s * 0.28, cx + s * 0.35, cy + s * 0.28)
        elif icon == "cable":
            c.bezier(cx - s * 0.35, cy, cx - s * 0.10, cy + s * 0.28, cx + s * 0.12, cy - s * 0.24, cx + s * 0.34, cy)
            c.circle(cx + s * 0.34, cy, 3, stroke=1, fill=0)
        elif icon == "walker":
            c.line(cx - s * 0.25, cy + s * 0.24, cx - s * 0.25, cy - s * 0.18)
            c.line(cx + s * 0.25, cy + s * 0.24, cx + s * 0.25, cy - s * 0.18)
            c.line(cx - s * 0.25, cy + s * 0.08, cx + s * 0.25, cy + s * 0.08)
            c.circle(cx - s * 0.25, cy - s * 0.22, 3, stroke=1, fill=0)
            c.circle(cx + s * 0.25, cy - s * 0.22, 3, stroke=1, fill=0)
        elif icon in ("threshold", "rain_path"):
            c.line(cx - s * 0.38, cy - s * 0.16, cx + s * 0.38, cy - s * 0.16)
            c.rect(cx - s * 0.08, cy - s * 0.16, s * 0.16, s * 0.25, stroke=1, fill=0)
            if icon == "rain_path":
                for dx in (-0.22, 0, 0.22):
                    c.line(cx + s * dx, cy + s * 0.3, cx + s * (dx - 0.08), cy + s * 0.12)
        elif icon == "door":
            c.rect(cx - s * 0.22, cy - s * 0.28, s * 0.44, s * 0.56, stroke=1, fill=0)
            c.circle(cx + s * 0.12, cy, 2.2, stroke=1, fill=0)
        elif icon in ("light", "lamp"):
            c.circle(cx, cy + s * 0.12, s * 0.18, stroke=1, fill=0)
            c.line(cx, cy - s * 0.08, cx, cy - s * 0.30)
            c.line(cx - s * 0.22, cy - s * 0.30, cx + s * 0.22, cy - s * 0.30)
            for dx in (-0.26, 0, 0.26):
                c.line(cx + s * dx, cy + s * 0.36, cx + s * dx, cy + s * 0.46)
        elif icon == "rail":
            c.setStrokeColor(colors.HexColor("#6FAE33"))
            c.setLineWidth(4)
            c.line(cx - s * 0.36, cy + s * 0.12, cx + s * 0.36, cy + s * 0.12)
            c.setLineWidth(2)
            c.line(cx - s * 0.28, cy + s * 0.12, cx - s * 0.28, cy - s * 0.22)
            c.line(cx + s * 0.28, cy + s * 0.12, cx + s * 0.28, cy - s * 0.22)
        elif icon in ("step_edges", "stairs_clutter"):
            for i in range(4):
                c.line(cx - s * 0.36 + i * s * 0.18, cy - s * 0.20 + i * s * 0.10, cx - s * 0.18 + i * s * 0.18, cy - s * 0.20 + i * s * 0.10)
                c.line(cx - s * 0.18 + i * s * 0.18, cy - s * 0.20 + i * s * 0.10, cx - s * 0.18 + i * s * 0.18, cy - s * 0.10 + i * s * 0.10)
            if icon == "stairs_clutter":
                c.setFillColor(colors.HexColor("#F6D1B8"))
                c.roundRect(cx + s * 0.10, cy - s * 0.10, s * 0.18, s * 0.14, 2, stroke=0, fill=1)
        elif icon == "chair":
            c.roundRect(cx - s * 0.22, cy, s * 0.44, s * 0.18, 4, stroke=1, fill=0)
            c.line(cx - s * 0.20, cy, cx - s * 0.28, cy - s * 0.28)
            c.line(cx + s * 0.20, cy, cx + s * 0.28, cy - s * 0.28)
            c.line(cx - s * 0.20, cy + s * 0.18, cx - s * 0.24, cy + s * 0.42)
        elif icon == "low_table":
            c.line(cx - s * 0.32, cy, cx + s * 0.32, cy)
            c.line(cx - s * 0.24, cy, cx - s * 0.32, cy - s * 0.22)
            c.line(cx + s * 0.24, cy, cx + s * 0.32, cy - s * 0.22)
            c.setStrokeColor(colors.HexColor("#C85F3E"))
            c.line(cx - s * 0.30, cy - s * 0.30, cx + s * 0.30, cy + s * 0.30)
        elif icon == "remote":
            c.roundRect(cx - s * 0.13, cy - s * 0.28, s * 0.26, s * 0.56, 5, stroke=1, fill=0)
            for y in (-0.12, 0.04, 0.20):
                c.circle(cx, cy + s * y, 2, stroke=1, fill=0)
        elif icon == "bed":
            c.roundRect(cx - s * 0.36, cy - s * 0.08, s * 0.72, s * 0.26, 4, stroke=1, fill=0)
            c.roundRect(cx - s * 0.32, cy + s * 0.02, s * 0.20, s * 0.12, 3, stroke=1, fill=0)
            c.line(cx - s * 0.36, cy - s * 0.08, cx - s * 0.36, cy - s * 0.25)
            c.line(cx + s * 0.36, cy - s * 0.08, cx + s * 0.36, cy - s * 0.25)
        elif icon == "shoes":
            c.roundRect(cx - s * 0.30, cy - s * 0.05, s * 0.28, s * 0.15, 6, stroke=1, fill=0)
            c.roundRect(cx + s * 0.02, cy - s * 0.05, s * 0.28, s * 0.15, 6, stroke=1, fill=0)
        elif icon == "wet_floor":
            for dx, dy in [(-0.18, 0.15), (0.10, 0.24), (0.24, -0.08)]:
                c.circle(cx + s * dx, cy + s * dy, 3.5, stroke=1, fill=0)
            c.setStrokeColor(colors.HexColor("#C85F3E"))
            c.line(cx - s * 0.32, cy - s * 0.20, cx + s * 0.32, cy - s * 0.20)
        elif icon == "grab_bar":
            c.setStrokeColor(colors.HexColor("#6FAE33"))
            c.setLineWidth(4)
            c.line(cx - s * 0.34, cy + s * 0.12, cx + s * 0.34, cy + s * 0.12)
            c.line(cx - s * 0.22, cy - s * 0.14, cx + s * 0.22, cy - s * 0.14)
        elif icon == "toilet":
            c.roundRect(cx - s * 0.22, cy - s * 0.12, s * 0.34, s * 0.25, 4, stroke=1, fill=0)
            c.rect(cx + s * 0.12, cy - s * 0.02, s * 0.20, s * 0.28, stroke=1, fill=0)
        elif icon == "shelf":
            for y in (-0.18, 0.04, 0.26):
                c.line(cx - s * 0.34, cy + s * y, cx + s * 0.34, cy + s * y)
            c.rect(cx - s * 0.20, cy - s * 0.13, s * 0.16, s * 0.13, stroke=1, fill=0)
            c.rect(cx + s * 0.08, cy + s * 0.08, s * 0.16, s * 0.13, stroke=1, fill=0)
        elif icon == "stool":
            c.line(cx - s * 0.24, cy + s * 0.12, cx + s * 0.24, cy + s * 0.12)
            c.line(cx - s * 0.16, cy + s * 0.12, cx - s * 0.28, cy - s * 0.22)
            c.line(cx + s * 0.16, cy + s * 0.12, cx + s * 0.28, cy - s * 0.22)
            c.setStrokeColor(colors.HexColor("#C85F3E"))
            c.line(cx - s * 0.34, cy - s * 0.30, cx + s * 0.34, cy + s * 0.30)
        elif icon == "pan":
            c.circle(cx - s * 0.10, cy, s * 0.16, stroke=1, fill=0)
            c.line(cx + s * 0.06, cy, cx + s * 0.38, cy + s * 0.12)
        elif icon == "laundry":
            c.roundRect(cx - s * 0.28, cy - s * 0.18, s * 0.56, s * 0.34, 5, stroke=1, fill=0)
            c.arc(cx - s * 0.18, cy + s * 0.04, cx + s * 0.18, cy + s * 0.32, 0, 180)
        elif icon == "leak":
            c.rect(cx - s * 0.22, cy - s * 0.20, s * 0.44, s * 0.44, stroke=1, fill=0)
            c.circle(cx, cy, s * 0.12, stroke=1, fill=0)
            c.line(cx + s * 0.26, cy - s * 0.05, cx + s * 0.38, cy - s * 0.18)
            c.circle(cx + s * 0.40, cy - s * 0.22, 2.8, stroke=1, fill=0)
        elif icon == "button":
            c.circle(cx, cy, s * 0.26, stroke=1, fill=0)
            c.circle(cx, cy, s * 0.10, stroke=1, fill=0)
        elif icon == "phone112":
            c.roundRect(cx - s * 0.23, cy - s * 0.30, s * 0.46, s * 0.60, 5, stroke=1, fill=0)
            c.setFillColor(ink)
            c.setFont(FONT_BOLD, 10)
            c.drawCentredString(cx, cy - 3, "112")
        elif icon == "response":
            for dx in (-0.24, 0, 0.24):
                c.circle(cx + s * dx, cy + s * 0.08, s * 0.08, stroke=1, fill=0)
                c.line(cx + s * dx, cy - s * 0.01, cx + s * dx, cy - s * 0.20)
            c.line(cx - s * 0.16, cy - s * 0.18, cx + s * 0.16, cy - s * 0.18)
        c.restoreState()


def visual_guide(section_visual: dict, language: str, styles) -> Table:
    diagram = GuideDiagram(section_visual["diagram"], language)
    card = Table([
        [Paragraph(escape(section_visual["title"][language]), styles["visual_title"])],
        [diagram],
    ], colWidths=[171 * mm])
    card.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4FBFF")),
        ("BOX", (0, 0), (-1, -1), 0.55, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (0, 0), 2),
    ]))
    return card


def checklist_table(items, language, copy, styles) -> list:
    cards = []
    for checklist_item in items:
        tag_code = checklist_item["tag"]
        tag_label = copy["priority"][tag_code][0]
        card = Table([[
            Paragraph("□", styles["check"]),
            Paragraph(escape(tag_label), styles["tag"]),
            Paragraph(escape(checklist_item[language]), styles["body"]),
        ]], colWidths=[14 * mm, 33 * mm, 124 * mm])
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), WHITE),
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#EEF8FD")),
            ("BACKGROUND", (1, 0), (1, 0), TAG_COLOURS[tag_code]),
            ("BOX", (0, 0), (-1, -1), 0.45, BORDER),
            ("LINEAFTER", (1, 0), (1, 0), 0.45, WHITE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (0, 0), 4),
            ("RIGHTPADDING", (0, 0), (0, 0), 4),
            ("LEFTPADDING", (1, 0), (1, 0), 5),
            ("RIGHTPADDING", (1, 0), (1, 0), 5),
            ("LEFTPADDING", (2, 0), (2, 0), 9),
            ("RIGHTPADDING", (2, 0), (2, 0), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        cards.extend([card, Spacer(1, 2.2 * mm)])
    return cards


def quick_wins_page(copy: dict, styles: dict[str, ParagraphStyle]) -> list:
    story = [
        Paragraph(escape(copy["quick_wins_title"]), styles["h1"]),
        Paragraph(escape(copy["quick_wins_intro"]), styles["intro"]),
    ]
    rows = []
    for index in range(0, 10, 2):
        left = Table([[
            Paragraph(f"{index + 1:02d}", styles["visual_label"]),
            Paragraph(escape(copy["quick_wins"][index]), styles["body_small"]),
        ]], colWidths=[14 * mm, 68 * mm])
        right = Table([[
            Paragraph(f"{index + 2:02d}", styles["visual_label"]),
            Paragraph(escape(copy["quick_wins"][index + 1]), styles["body_small"]),
        ]], colWidths=[14 * mm, 68 * mm])
        for card in (left, right):
            card.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#E1F2FC")),
                ("BOX", (0, 0), (-1, -1), 0.45, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]))
        rows.append([left, right])

    grid = Table(rows, colWidths=[84 * mm, 84 * mm], rowHeights=[18 * mm] * 5)
    grid.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(grid)
    return story


def photo_prompt_box(diagram_type: str, language: str, copy: dict, styles: dict[str, ParagraphStyle]) -> Table:
    prompts = PHOTO_PROMPTS[diagram_type][language]
    prompt_cells = []
    for index, prompt in enumerate(prompts, 1):
        prompt_cells.append(Table([[
            Paragraph(f"{index:02d}", styles["visual_label"]),
            Paragraph(escape(prompt), styles["body_small"]),
        ]], colWidths=[10 * mm, 30.5 * mm]))

    for cell in prompt_cells:
        cell.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), WHITE),
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#E1F2FC")),
            ("BOX", (0, 0), (-1, -1), 0.35, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))

    prompts_table = Table([prompt_cells], colWidths=[40.75 * mm] * 4)
    prompts_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    title = Table([[
        Paragraph(escape(copy["photo_prompt_title"]), styles["field"]),
        Paragraph(escape(copy["photo_prompt_intro"]), styles["small"]),
    ]], colWidths=[31 * mm, 132 * mm])
    title.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    box = Table([
        [title],
        [prompts_table],
    ], colWidths=[171 * mm])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7FBFE")),
        ("BOX", (0, 0), (-1, -1), 0.45, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return box


def notes_box(title, styles) -> list:
    lines = Table([[""], [""]], colWidths=[171 * mm], rowHeights=[8 * mm, 8 * mm])
    lines.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return [Spacer(1, 5 * mm), Paragraph(escape(title), styles["field"]), lines]


def build_story(language: str, copy: dict, styles: dict[str, ParagraphStyle]) -> list:
    story = []

    story.append(Spacer(1, 11 * mm))
    cover_label = Table(
        [[Paragraph(escape(copy["cover_label"]), styles["cover_label"])]],
        colWidths=[62 * mm],
        rowHeights=[10 * mm],
    )
    cover_label.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
        ("BOX", (0, 0), (-1, -1), 0, PALE_BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    cover_label.hAlign = "LEFT"

    meta_cells = [
        Paragraph(escape(copy["cover_meta"][0]), styles["cover_meta"]),
        Paragraph(escape(copy["cover_meta"][1]), styles["cover_meta"]),
        Paragraph(escape(copy["cover_meta"][2]), styles["cover_meta"]),
    ]
    cover_meta = Table([meta_cells], colWidths=[41 * mm, 48 * mm, 47 * mm], rowHeights=[14 * mm])
    cover_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0, WHITE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D5E8F2")),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    cover_meta.hAlign = "LEFT"

    if LOGO.exists():
        logo = RLImage(str(LOGO), width=55 * mm, height=17.2 * mm)
        logo.hAlign = "LEFT"
        story.append(logo)
        story.append(Spacer(1, 20 * mm))
    story.append(cover_label)
    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph(escape(copy["title"]), styles["cover_title"]))
    story.append(Paragraph(escape(copy["subtitle"]), styles["cover_subtitle"]))
    story.append(Spacer(1, 4 * mm))
    story.append(cover_meta)
    story.append(Spacer(1, 9 * mm))
    story.append(Paragraph(escape(copy["cover_note"]), styles["cover_note"]))
    story.append(PageBreak())

    story.append(Paragraph(escape(copy["how_title"]), styles["h1"]))
    story.append(Paragraph(escape(copy["how_intro"]), styles["intro"]))
    step_rows = []
    for index, step in enumerate(copy["steps"], 1):
        step_rows.append([
            Paragraph(str(index), styles["tag"]),
            Paragraph(escape(step), styles["body"]),
        ])
    steps_table = Table(step_rows, colWidths=[11 * mm, 160 * mm])
    steps_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (0, -1), BLUE),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(steps_table)
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph(escape(copy["priority_title"]), styles["h2"]))
    priority_rows = []
    priority_styles = []
    for row_index, tag_code in enumerate(["NOW", "CHECK", "PLAN", "PRO", "FIT"]):
        label, description = copy["priority"][tag_code]
        priority_rows.append([
            Paragraph(escape(label), styles["tag"]),
            Paragraph(escape(description), styles["body_small"]),
        ])
        priority_styles.append(("BACKGROUND", (0, row_index), (0, row_index), TAG_COLOURS[tag_code]))
    priority_table = Table(priority_rows, colWidths=[31 * mm, 140 * mm])
    priority_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        *priority_styles,
    ]))
    story.append(priority_table)
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph(escape(copy["profile_title"]), styles["h2"]))
    profile_rows = []
    for index in range(0, len(copy["profile_fields"]), 2):
        profile_rows.append([
            Paragraph(escape(copy["profile_fields"][index]), styles["field"]), "",
            Paragraph(escape(copy["profile_fields"][index + 1]), styles["field"]), "",
        ])
    profile_table = Table(profile_rows, colWidths=[30 * mm, 55.5 * mm, 30 * mm, 55.5 * mm], rowHeights=[10 * mm] * 3)
    profile_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, BORDER),
        ("BACKGROUND", (0, 0), (0, -1), PALE_BLUE),
        ("BACKGROUND", (2, 0), (2, -1), PALE_BLUE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(profile_table)
    story.append(Spacer(1, 4 * mm))
    safety_box = Table([[Paragraph(escape(copy["safety_note"]), styles["body_small"])]], colWidths=[171 * mm])
    safety_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_GREEN),
        ("BOX", (0, 0), (-1, -1), 0.6, GREEN),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(safety_box)
    story.append(PageBreak())

    story.extend(quick_wins_page(copy, styles))
    story.append(PageBreak())

    for section_index, section in enumerate(SECTIONS):
        if section_index > 0:
            story.append(CondPageBreak(112 * mm))
        story.append(Paragraph(escape(section["title"][language]), styles["h1"]))
        story.append(Paragraph(escape(section["intro"][language]), styles["intro"]))
        story.append(visual_guide(SECTION_VISUALS[section_index], language, styles))
        story.append(Spacer(1, 3 * mm))
        story.append(photo_prompt_box(SECTION_VISUALS[section_index]["diagram"], language, copy, styles))
        story.append(Spacer(1, 5 * mm))
        story.append(Paragraph(escape(SECTION_HELPER[language]), styles["section_helper"]))
        story.extend(checklist_table(section["items"], language, copy, styles))
        story.extend(notes_box(copy["section_notes"], styles))

    story.append(PageBreak())
    story.append(Paragraph(escape(copy["plan_title"]), styles["h1"]))
    story.append(Paragraph(escape(copy["plan_intro"]), styles["intro"]))
    questions = [copy["resident_question"], copy["hardest_question"], copy["recent_question"], copy["decision_question"]]
    question_rows = []
    for question in questions:
        question_rows.append([Paragraph(escape(question), styles["field"]), ""])
    question_table = Table(question_rows, colWidths=[73 * mm, 98 * mm], rowHeights=[12 * mm] * 4)
    question_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, BORDER),
        ("BACKGROUND", (0, 0), (0, -1), PALE_BLUE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(question_table)
    story.append(Spacer(1, 6 * mm))
    plan_rows = [[Paragraph(escape(header), styles["table_header"]) for header in copy["plan_headers"]]]
    plan_rows.extend([["", "", "", "", ""] for _ in range(5)])
    plan_table = Table(plan_rows, colWidths=[25 * mm, 38 * mm, 34 * mm, 43 * mm, 31 * mm], rowHeights=[12 * mm] + [24 * mm] * 5)
    plan_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(plan_table)

    story.append(PageBreak())
    story.append(Paragraph(escape(copy["quote_title"]), styles["h1"]))
    story.extend(checklist_table([{"tag": "CHECK", language: value} for value in copy["quote_items"]], language, copy, styles))
    story.append(Spacer(1, 7 * mm))
    story.append(Paragraph(escape(copy["handover_title"]), styles["h1"]))
    story.extend(checklist_table([{"tag": "PLAN", language: value} for value in copy["handover_items"]], language, copy, styles))

    story.append(PageBreak())
    story.append(Paragraph(escape(copy["sources_title"]), styles["h1"]))
    story.append(Paragraph(escape(copy["sources_intro"]), styles["intro"]))
    source_rows = []
    for index, source in enumerate(copy["sources"], 1):
        source_rows.append([
            Paragraph(str(index), styles["tag"]),
            Paragraph(escape(source), styles["source"]),
        ])
    source_table = Table(source_rows, colWidths=[10 * mm, 161 * mm])
    source_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (0, -1), NAVY_MID),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(source_table)
    story.append(Spacer(1, 9 * mm))
    story.append(Paragraph(escape(copy["safety_note"]), styles["body"]))
    story.append(Spacer(1, 12 * mm))
    closing = Table([
        [Paragraph("CasaMia", ParagraphStyle("closing_brand", fontName=FONT_BOLD, fontSize=18, textColor=WHITE)),
         Paragraph("casamia.com.es", ParagraphStyle("closing_url", fontName=FONT_BOLD, fontSize=10, textColor=WHITE, alignment=TA_CENTER))]
    ], colWidths=[110 * mm, 61 * mm], rowHeights=[24 * mm])
    closing.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(closing)
    return story


def generate(language: str) -> Path:
    copy = COPY[language]
    styles = make_styles()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / copy["file"]
    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=23 * mm,
        bottomMargin=18 * mm,
        title=copy["title"],
        author="CasaMia",
        subject=copy["subtitle"],
    )
    story = build_story(language, copy, styles)
    document.build(
        story,
        onFirstPage=draw_cover,
        onLaterPages=lambda canvas, doc: draw_body_page(canvas, doc, copy),
    )
    public_path = PUBLIC_DIR / copy["file"]
    shutil.copy2(output_path, public_path)
    reader = PdfReader(str(output_path))
    if len(reader.pages) < 13:
        raise RuntimeError(f"Expected a comprehensive guide, got only {len(reader.pages)} pages")
    extracted = "\n".join((page.extract_text() or "") for page in reader.pages)
    normalized_text = " ".join(extracted.split())
    for expected in (copy["title"], "112", "casamia.com.es"):
        if " ".join(expected.split()) not in normalized_text:
            raise RuntimeError(f"Missing expected PDF text: {expected}")
    print(f"Generated {output_path} ({len(reader.pages)} pages)")
    print(f"Published {public_path}")
    return output_path


def main() -> None:
    configure_fonts()
    total_checks = sum(len(section["items"]) for section in SECTIONS)
    if total_checks < 100:
        raise RuntimeError(f"Checklist must contain at least 100 checks; found {total_checks}")
    print(f"Checklist items: {total_checks}")
    for language in ("en", "es"):
        generate(language)


if __name__ == "__main__":
    main()
