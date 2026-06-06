import pyttsx3
import datetime
import speech_recognition as sr
import wikipedia
wikipedia.set_user_agent("JarvisVoiceAssistant/1.0 (contact@example.com)")
import webbrowser
import re
import time
import os   
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import queue
import threading

# Queue to store SSE events for the React frontend
event_queue = queue.Queue(maxsize=10)

def send_ui_event(state, **kwargs):
    event = {"state": state}
    event.update(kwargs)
    try:
        event_queue.put_nowait(event)
    except queue.Full:
        try:
            event_queue.get_nowait()
            event_queue.put_nowait(event)
        except Exception:
            pass

class SSEHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Mute logging to keep stdout clean
        return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/events':
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            while True:
                try:
                    event_data = event_queue.get(timeout=1.0)
                    self.wfile.write(f"data: {json.dumps(event_data)}\n\n".encode('utf-8'))
                    self.wfile.flush()
                except queue.Empty:
                    try:
                        self.wfile.write(b": keep-alive\n\n")
                        self.wfile.flush()
                    except Exception:
                        break
                except Exception:
                    break
        else:
            self.send_response(404)
            self.end_headers()

def start_sse_server():
    try:
        server = HTTPServer(('localhost', 8000), SSEHandler)
        server.serve_forever()
    except Exception as e:
        print(f"SSE server error: {e}")

# Start the local event broadcast server on port 8000
threading.Thread(target=start_sse_server, daemon=True).start()

# Initialize TTS engine
def speak(text):
    send_ui_event("speaking", response=text)
    engine = pyttsx3.init('sapi5')
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[0].id) 
    engine.setProperty('rate', 180)
    engine.say(text)
    engine.runAndWait()
    send_ui_event("idle")

#for greeting me
def greetMessage():
    hour = int(datetime.datetime.now().hour)
    if 0 <= hour < 12:
        greeting = 'Good Morning'
    elif 12 <= hour < 18:
        greeting = 'Good Afternoon'
    else:
        greeting = 'Good Evening'
    full_greeting = f"{greeting}! I am Jarvis, your personal assistant. How can I help you today?"
    speak(full_greeting)

# for taking command
def takeCommand():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        send_ui_event("listening")
        r.pause_threshold = 2
        audio = r.listen(source)
    try:
        print("Recognizing...")
        query = r.recognize_google(audio, language='en-in')
        print(f"User said: {query}\n")
        send_ui_event("processing", query=query)
    except Exception as e:
        print(f"Say that again: {e}\n")
        send_ui_event("idle")
        return "None"
    return query.lower()

# def sendEmail(to, content):
#     email block


def executeQuery(query):
    if query == "none":
        return True

    # Wikipedia search & speak directly
    if 'wikipedia' in query:
        speak("Searching Wikipedia...")
        
        # Remove wake word first
        search_term = query.replace("jarvis", "").strip()

        # Clean query using filler phrases (ordered longest to shortest)
        filler_words = [
            'according to wikipedia', 'according to', 'wikipedia',
            'tell me about', 'tell me', 'search for', 'search',
            'what are', 'what is', 'who are', 'who is', 'define', 'explain',
            'hey', 'hi', 'hello', 'please', 'pls'
        ]
        for word in filler_words:
            search_term = search_term.replace(word, "")
        
        # Collapse multiple spaces and strip
        search_term = re.sub(r'\s+', ' ', search_term).strip()

        if not search_term:
            speak("Sorry, I did not catch the topic you want to search.")
            return True

        print(f"Searching Wikipedia for: '{search_term}'")
        try:
            results = wikipedia.summary(search_term, sentences=2)
            
            # Clean text and speak immediately
            clean_results = re.sub(r'[\(\)\[\]\{\}\'\"“”–-]', '', results)
            clean_results = re.sub(r'\s+', ' ', clean_results)
            
            # Speak sentence by sentence
            for sentence in clean_results.split('. '):
                sentence = sentence.strip()
                if sentence:
                    print("Speaking:", sentence)
                    speak(sentence)
                    time.sleep(0.2)
                    
        except wikipedia.exceptions.DisambiguationError as e:
            first_option = e.options[0]
            results = wikipedia.summary(first_option, sentences=2)
            clean_results = re.sub(r'[\(\)\[\]\{\}\'\"“”–-]', '', results)
            clean_results = re.sub(r'\s+', ' ', clean_results)
            speak(f"Showing results for {first_option}")
            for sentence in clean_results.split('. '):
                sentence = sentence.strip()
                if sentence:
                    print("Speaking:", sentence)
                    speak(sentence)
                    time.sleep(0.2)
                    
        except wikipedia.exceptions.PageError:
            speak("Sorry, I could not find any results for your query.")
        except Exception as e:
            print(f"Error searching Wikipedia: {e}")
            speak("Sorry, I am having trouble connecting to Wikipedia at the moment.")

    # Open YouTube
    elif 'open youtube' in query:
        speak("Opening YouTube")
        webbrowser.open("https://www.youtube.com")

    # Open Google
    elif 'open google' in query:
        speak("Opening Google")
        webbrowser.open("https://www.google.com")

    # Tell current time
    elif 'time' in query:
        str_time = datetime.datetime.now().strftime("%I:%M %p")
        speak(f"The time is {str_time}")

    # Tell current date
    elif 'date' in query:
        str_date = datetime.datetime.now().strftime("%B %d, %Y")
        speak(f"The date is {str_date}") 


    # play music
    elif 'play music' in query:
        music_dir = 'C:\\Users\\Merin Joys\\Music'
        songs = os.listdir(music_dir)
        print(songs)
        speak("Playing music")
        os.startfile(os.path.join(music_dir, songs[0]))
    
    #open vs code
    elif 'open v s code' in query:
        codepath='C:\\Users\\Merin Joys\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe'
        os.startfile(codepath)
        speak("Opening VSCode")
    
    # #sending email
    # elif 'send jessy email' in query:
    #     try:
    #         speak("tell what should i say")
    #         content = takeCommand()
    #         to = "yourmail@gmail.com"
    #         sendEmail(to, content)
    #         speak("Email sent")
    #     except Exception as e:
    #         speak(f"Sorry, I could not send the email. {e}")

    
    # Exit Jarvis
    elif 'exit' in query or 'quit' in query:
        speak("Jarvis signing off. love you 3000")
        return False

    # Handle unknown commands
    else:
        speak("Sorry, I did not understand that. Please try again.")
  
    return True


if __name__ == '__main__':
    greetMessage()

    while True:
        query = takeCommand()
        should_continue = executeQuery(query)
        if not should_continue:
            break
      
        