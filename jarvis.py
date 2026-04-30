import pyttsx3
import datetime
import speech_recognition as sr
import wikipedia
import webbrowser
import re
import time
import os   
import subprocess

# Initialize TTS engine
def speak(text):
    engine = pyttsx3.init('sapi5')
    voices = engine.getProperty('voices')
    engine.setProperty('voice', voices[0].id) 
    engine.setProperty('rate', 180)
    engine.say(text)
    engine.runAndWait()
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
        r.pause_threshold = 2
        audio = r.listen(source)
    try:
        print("Recognizing...")
        query = r.recognize_google(audio, language='en-in')
        print(f"User said: {query}\n")
    except Exception as e:
        print(f"Say that again: {e}\n")
        return "None"
    return query.lower()

# def sendEmail(to, content):
#     email block


if __name__ == '__main__':
    greetMessage()

    while True:
        query = takeCommand()
        if query == "none":
            continue

        # Wikipedia search & speak directly
        if 'wikipedia' in query:
            speak("Searching Wikipedia...")
            
            # Clean query
            filler_words = ['wikipedia', 'according to', 'tell me about', 'who is', 'what is', 'search for']
            search_term = query
            for word in filler_words:
                search_term = search_term.replace(word, "")
            search_term = search_term.strip()

            if not search_term:
                speak("Sorry, I did not catch the topic you want to search.")
                continue

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
        elif 'open vs code' in query:
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
            break

        # Handle unknown commands
        else:
            speak("Sorry, I did not understand that. Please try again.")
      
        