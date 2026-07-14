import { useState, useEffect, useRef } from 'react'
import { Room, Track, VideoPresets } from 'livekit-client'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorUp, 
  PhoneOff,
  MessageSquare,
  Users,
  Send
} from 'lucide-react'
import ChatPanel from './ChatPanel'
import ParticipantList from './ParticipantList'

const VideoRoom = ({ roomName, token, url, participantName, onLeave }) => {
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [participants, setParticipants] = useState([])
  const [localParticipant, setLocalParticipant] = useState(null)
  const roomRef = useRef(null)

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        console.log('Connecting to LiveKit server:', url)
        console.log('Room name:', roomName)
        
        const livekitRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720,
          },
          audioCaptureDefaults: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          },
          rtcConfig: {
            iceTransportPolicy: 'all',
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        })

        await livekitRoom.connect(url, token)
        roomRef.current = livekitRoom
        console.log('Connected to room successfully')

        // Enable camera and microphone
        try {
          await livekitRoom.localParticipant.setCameraEnabled(true)
          console.log('Camera enabled')
          setIsCameraEnabled(true)
        } catch (camError) {
          console.error('Failed to enable camera:', camError)
          alert('Không thể bật camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.')
        }

        try {
          await livekitRoom.localParticipant.setMicrophoneEnabled(true)
          console.log('Microphone enabled')
          setIsMicEnabled(true)
        } catch (micError) {
          console.error('Failed to enable microphone:', micError)
          alert('Không thể bật microphone. Vui lòng cấp quyền truy cập microphone trong trình duyệt.')
        }

        // Set local participant
        setLocalParticipant(livekitRoom.localParticipant)

        // Handle participants joining/leaving
        livekitRoom.on('participantConnected', (participant) => {
          setParticipants(prev => [...prev, participant])
        })

        livekitRoom.on('participantDisconnected', (participant) => {
          setParticipants(prev => prev.filter(p => p.sid !== participant.sid))
        })

        // Set initial participants
        setParticipants(Array.from(livekitRoom.remoteParticipants.values()))

        // Handle data channel messages
        livekitRoom.on('dataReceived', (payload) => {
          const decoder = new TextDecoder()
          const message = JSON.parse(decoder.decode(payload))
          setMessages(prev => [...prev, message])
        })

        console.log('Connected to room:', roomName)
      } catch (error) {
        console.error('Failed to connect to room:', error)
        alert('Không thể kết nối đến phòng. Vui lòng kiểm tra LiveKit server và thử lại.')
      }
    }

    connectToRoom()

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect()
      }
    }
  }, [])

  const toggleMic = async () => {
    if (roomRef.current) {
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isMicEnabled)
      setIsMicEnabled(!isMicEnabled)
    }
  }

  const toggleCamera = async () => {
    if (roomRef.current) {
      await roomRef.current.localParticipant.setCameraEnabled(!isCameraEnabled)
      setIsCameraEnabled(!isCameraEnabled)
    }
  }

  const toggleScreenShare = async () => {
    if (roomRef.current) {
      if (!isScreenSharing) {
        await roomRef.current.localParticipant.setScreenShareEnabled(true)
        setIsScreenSharing(true)
      } else {
        await roomRef.current.localParticipant.setScreenShareEnabled(false)
        setIsScreenSharing(false)
      }
    }
  }

  const handleLeave = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect()
    }
    onLeave()
  }

  const sendMessage = () => {
    if (newMessage.trim() && roomRef.current) {
      const message = {
        id: Date.now(),
        sender: participantName,
        text: newMessage,
        timestamp: new Date().toISOString()
      }
      const encoder = new TextEncoder()
      roomRef.current.localParticipant.publishData(encoder.encode(JSON.stringify(message)))
      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const renderParticipant = (participant, isLocal = false) => {
    const videoTrack = participant.getTrackPublication(Track.Source.Camera)?.track
    const screenTrack = participant.getTrackPublication(Track.Source.ScreenShare)?.track

    return (
      <div key={participant.sid} className="relative bg-gray-800 rounded-xl overflow-hidden">
        {screenTrack ? (
          <video
            ref={el => {
              if (el && screenTrack) {
                screenTrack.attach(el)
              }
            }}
            autoPlay
            className="w-full h-48 object-cover"
          />
        ) : videoTrack ? (
          <video
            ref={el => {
              if (el && videoTrack) {
                videoTrack.attach(el)
              }
            }}
            autoPlay
            muted={isLocal}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-700">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {participant.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
          {participant.name} {isLocal && '(You)'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-semibold">{roomName}</h1>
          <p className="text-gray-400 text-sm">
            {participants.length + 1}{(participants.length + 1) === 1 ? ' participant' : ' participants'}
          </p>
        </div>
        <button
          onClick={handleLeave}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PhoneOff className="w-5 h-5" />
          Leave
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Local Participant */}
          {localParticipant && renderParticipant(localParticipant, true)}
          
          {/* Remote Participants */}
          {participants.map(participant => renderParticipant(participant))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-colors ${
            isMicEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isMicEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-colors ${
            isCameraEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isCameraEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full transition-colors ${
            isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <MonitorUp className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-4 rounded-full transition-colors ${
            showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className={`p-4 rounded-full transition-colors ${
            showParticipants ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Users className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <ChatPanel
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Participant List */}
      {showParticipants && (
        <ParticipantList
          participants={participants}
          localParticipant={localParticipant}
          onClose={() => setShowParticipants(false)}
        />
      )}
    </div>
  )
}

export default VideoRoom
