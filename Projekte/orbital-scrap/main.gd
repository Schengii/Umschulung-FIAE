extends Control

# Ressourcen (Jetzt als float für präzise Berechnungen im Hintergrund)
var scrapCount: float = 0.0
var scrapPerSecond: float = 0.0

# Drohnen-Einstellungen
var droneCount: int = 0
var droneBaseCost: int = 10
var droneProduction: float = 0.2 # Jede Drohne macht 0.2 Schrott pro Sekunde

func _ready() -> void:
	update_ui()

# Der Game Loop: Wird von Godot jeden Frame automatisch aufgerufen
func _process(delta: float) -> void:
	if scrapPerSecond > 0:
		# Wir rechnen: Produktion * vergangene Zeit (Delta)
		scrapCount += scrapPerSecond * delta
		# UI in jedem Frame updaten, damit die Zahlen flüssig steigen
		update_ui()

# UI aktualisieren
func update_ui() -> void:
	# int(scrapCount) schneidet die Nachkommastellen für die Anzeige ab
	$ScrapLabel.text = "Schrott: " + str(int(scrapCount))
	$DroneLabel.text = "Drohnen: " + str(droneCount) + " (Kosten: " + str(get_drone_cost()) + ")"

# Diese Zeile ist neu: Zeigt die Produktion mit einer Nachkommastelle an
	$SpsLabel.text = "Produktion: " + str(scrapPerSecond) + " /s"

# Berechnet den Preis für die nächste Drohne (wird pro Drohne 15% teurer)
func get_drone_cost() -> int:
	return int(droneBaseCost * pow(1.15, droneCount))

# Klick-Button
func _on_scrap_button_pressed() -> void:
	print("Button wurde geklickt!")
	scrapCount += 1
	update_ui()

# Diese Funktion führen wir gleich beim Kauf aus
func _on_buy_drone_button_pressed() -> void:
	var cost = get_drone_cost()
	
	# Prüfen, ob wir genug Schrott haben
	if scrapCount >= cost:
		scrapCount -= cost
		droneCount += 1
		# Gesamtproduktion pro Sekunde neu berechnen
		scrapPerSecond = droneCount * droneProduction
		update_ui()
