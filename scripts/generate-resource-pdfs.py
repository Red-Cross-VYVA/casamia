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
    Image,
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
LOGO = ROOT / "public" / "brand-assets" / "casamia-logo-white-transparent.png"

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


def configure_fonts() -> None:
    global FONT_REGULAR, FONT_BOLD
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
            leading=12, textColor=WHITE, spaceAfter=20, tracking=1.5,
        ),
        "cover_title": ParagraphStyle(
            "cover_title", parent=base["Title"], fontName=FONT_BOLD, fontSize=31,
            leading=34, textColor=WHITE, alignment=TA_LEFT, spaceAfter=16,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=14,
            leading=20, textColor=colors.HexColor("#D9EAF3"), spaceAfter=24,
        ),
        "cover_note": ParagraphStyle(
            "cover_note", parent=base["Normal"], fontName=FONT_BOLD, fontSize=11,
            leading=15, textColor=WHITE,
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
        "body": ParagraphStyle(
            "body", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=9.3,
            leading=13.2, textColor=TEXT,
        ),
        "body_small": ParagraphStyle(
            "body_small", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=8.4,
            leading=11.2, textColor=TEXT,
        ),
        "small": ParagraphStyle(
            "small", parent=base["Normal"], fontName=FONT_REGULAR, fontSize=7.5,
            leading=10, textColor=MUTED,
        ),
        "tag": ParagraphStyle(
            "tag", parent=base["Normal"], fontName=FONT_BOLD, fontSize=6.7,
            leading=8, textColor=WHITE, alignment=TA_CENTER,
        ),
        "check": ParagraphStyle(
            "check", parent=base["Normal"], fontName=FONT_BOLD, fontSize=9,
            leading=12, textColor=NAVY, alignment=TA_CENTER,
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
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, width, height, stroke=0, fill=1)
    canvas.setFillColor(NAVY_MID)
    canvas.circle(width + 18 * mm, height - 22 * mm, 72 * mm, stroke=0, fill=1)
    canvas.setStrokeColor(colors.Color(1, 1, 1, alpha=0.08))
    canvas.setLineWidth(18)
    canvas.circle(width - 6 * mm, 4 * mm, 55 * mm, stroke=1, fill=0)
    canvas.setFillColor(GREEN)
    canvas.rect(18 * mm, 27 * mm, 30 * mm, 2.5 * mm, stroke=0, fill=1)
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
    canvas.drawString(18 * mm, 9 * mm, "casamia.es")
    canvas.drawRightString(width - 18 * mm, 9 * mm, str(doc.page))
    canvas.restoreState()


def checklist_table(items, language, copy, styles) -> Table:
    rows = []
    style_commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, BORDER),
    ]
    for row_index, checklist_item in enumerate(items):
        tag_code = checklist_item["tag"]
        tag_label = copy["priority"][tag_code][0]
        rows.append([
            Paragraph("[ ]", styles["check"]),
            Paragraph(escape(tag_label), styles["tag"]),
            Paragraph(escape(checklist_item[language]), styles["body"]),
        ])
        style_commands.extend([
            ("BACKGROUND", (0, row_index), (0, row_index), PALE_BLUE),
            ("BACKGROUND", (1, row_index), (1, row_index), TAG_COLOURS[tag_code]),
        ])

    table = Table(rows, colWidths=[13 * mm, 29 * mm, 129 * mm], repeatRows=0)
    table.setStyle(TableStyle(style_commands))
    return table


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

    story.append(Spacer(1, 14 * mm))
    if LOGO.exists():
        logo = Image(str(LOGO), width=55 * mm, height=17.2 * mm)
        logo.hAlign = "LEFT"
        story.append(logo)
    story.append(Spacer(1, 30 * mm))
    story.append(Paragraph(escape(copy["cover_label"]), styles["cover_label"]))
    story.append(Paragraph(escape(copy["title"]), styles["cover_title"]))
    story.append(Paragraph(escape(copy["subtitle"]), styles["cover_subtitle"]))

    cover_meta = [[Paragraph(escape(value), styles["cover_note"])] for value in copy["cover_meta"]]
    meta_table = Table(cover_meta, colWidths=[84 * mm], rowHeights=[12 * mm] * len(cover_meta))
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.Color(1, 1, 1, alpha=0.08)),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.Color(1, 1, 1, alpha=0.18)),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.Color(1, 1, 1, alpha=0.14)),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 22 * mm))
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

    for section_index, section in enumerate(SECTIONS):
        story.append(Paragraph(escape(section["title"][language]), styles["h1"]))
        story.append(Paragraph(escape(section["intro"][language]), styles["intro"]))
        story.append(checklist_table(section["items"], language, copy, styles))
        story.extend(notes_box(copy["section_notes"], styles))
        if section_index < len(SECTIONS) - 1:
            story.append(PageBreak())

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
    story.append(checklist_table([{"tag": "CHECK", language: value} for value in copy["quote_items"]], language, copy, styles))
    story.append(Spacer(1, 7 * mm))
    story.append(Paragraph(escape(copy["handover_title"]), styles["h1"]))
    story.append(checklist_table([{"tag": "PLAN", language: value} for value in copy["handover_items"]], language, copy, styles))

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
         Paragraph("casamia.es", ParagraphStyle("closing_url", fontName=FONT_BOLD, fontSize=10, textColor=WHITE, alignment=TA_CENTER))]
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
    for expected in (copy["title"], "112", "casamia.es"):
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
