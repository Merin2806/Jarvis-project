import tkinter as tk
import numpy as np
import sounddevice as sd

WIDTH = 500
HEIGHT = 600

root = tk.Tk()
root.title("Jarvis AI")
root.geometry(f"{WIDTH}x{HEIGHT}")
root.configure(bg="black")

canvas = tk.Canvas(root, width=WIDTH, height=400, bg="black", highlightthickness=0)
canvas.pack()

text_label = tk.Label(root,
                      text="Jarvis is ready...",
                      font=("Arial", 16),
                      fg="gold",
                      bg="black",
                      wraplength=400)

text_label.pack(pady=20)

center_x = WIDTH/2
center_y = 200
base_radius = 60

# Glow rings
for i in range(3):
    canvas.create_oval(center_x-70-i*10,
                       center_y-70-i*10,
                       center_x+70+i*10,
                       center_y+70+i*10,
                       outline="#FFD700",
                       width=2)

# Main circle
circle = canvas.create_oval(center_x-base_radius,
                            center_y-base_radius,
                            center_x+base_radius,
                            center_y+base_radius,
                            outline="gold",
                            width=4)
def update_circle(volume):

    radius = base_radius + volume * 200

    canvas.coords(circle,
                  center_x-radius,
                  center_y-radius,
                  center_x+radius,
                  center_y+radius)

def audio_callback(indata, frames, time, status):

    volume_norm = np.linalg.norm(indata) * 10
    root.after(0, update_circle, volume_norm)

stream = sd.InputStream(callback=audio_callback)

stream.start()

root.mainloop()