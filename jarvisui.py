import tkinter as tk
import numpy as np
import sounddevice as sd
import threading
from jarvis import speak, takeCommand, greetMessage, executeQuery

WIDTH = 500
HEIGHT = 600

root = tk.Tk()
root.title("Jarvis AI")
root.geometry(f"{WIDTH}x{HEIGHT}")
root.configure(bg="black")

canvas = tk.Canvas(root, width=WIDTH, height=400, bg="black", highlightthickness=0)
canvas.pack()

text_label = tk.Label(root,
                      text="Initializing Jarvis...",
                      font=("Arial", 16),
                      fg="gold",
                      bg="black",
                      wraplength=400)

text_label.pack(pady=20)

center_x = WIDTH/2
center_y = 200
base_radius = 60
core_radius = 25

# Glow rings
for i in range(3):
    outline_color = "#FF3333" if i % 2 == 0 else "#FFD700"
    canvas.create_oval(center_x-70-i*10,
                       center_y-70-i*10,
                       center_x+70+i*10,
                       center_y+70+i*10,
                       outline=outline_color,
                       width=2)

# Main circle
circle = canvas.create_oval(center_x-base_radius,
                            center_y-base_radius,
                            center_x+base_radius,
                            center_y+base_radius,
                            outline="#FFD700",
                            width=4)

# Inner red core
core = canvas.create_oval(center_x-core_radius,
                          center_y-core_radius,
                          center_x+core_radius,
                          center_y+core_radius,
                          fill="#b31010",
                          outline="#FF3333",
                          width=2)

def update_circle(volume):

    radius = base_radius + volume * 150

    canvas.coords(circle,
                  center_x-radius,
                  center_y-radius,
                  center_x+radius,
                  center_y+radius)

    # Also scale the inner red core slightly
    core_rad = core_radius + volume * 50
    canvas.coords(core,
                  center_x-core_rad,
                  center_y-core_rad,
                  center_x+core_rad,
                  center_y+core_rad)

def audio_callback(indata, frames, time, status):

    volume_norm = np.linalg.norm(indata) * 10
    root.after(0, update_circle, volume_norm)

def jarvis_voice_loop():
    # Warm up / Greet user
    greetMessage()
    
    while True:
        # Update text to show Listening
        root.after(0, lambda: text_label.config(text="Listening...", fg="gold"))
        
        query = takeCommand()
        if query == "none":
            continue
            
        # Update text to show what the user said
        root.after(0, lambda q=query: text_label.config(text=f"You: {q}", fg="#FF3333"))
        
        # Execute query using the unified query engine
        should_continue = executeQuery(query)
        
        if not should_continue:
            root.after(0, lambda: text_label.config(text="Signing off...", fg="red"))
            root.after(2000, root.destroy) # Close window after 2 seconds
            break

# Start Jarvis voice loop in a background thread
jarvis_thread = threading.Thread(target=jarvis_voice_loop, daemon=True)
jarvis_thread.start()

stream = sd.InputStream(callback=audio_callback)
stream.start()

root.mainloop()