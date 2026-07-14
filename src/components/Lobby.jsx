import { useState } from 'react'
import axios from 'axios'
import { Video, Users } from 'lucide-react'

const Lobby = ({ onJoin }) => {
  const [roomName, setRoomName] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [isCreating, setIsCreating] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response
      if (isCreating) {
        response = await axios.post('/api/video/create-room', {
          roomName,
          participantName,
          enableRecording: false
        })
      } else {
        response = await axios.post('/api/video/join-room', {
          roomName,
          participantName
        })
      }

      onJoin({
        roomName: response.data.roomName,
        token: response.data.accessToken,
        url: response.data.url,
        participantName
      })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Video Call</h1>
          <p className="text-gray-400">Connect with your team instantly</p>
        </div>

        <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsCreating(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              isCreating
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              !isCreating
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Join Room
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isCreating ? 'Room Name' : 'Room Name'}
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isCreating ? 'Enter room name' : 'Enter room name to join'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                {isCreating ? 'Create & Join Room' : 'Join Room'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Lobby
