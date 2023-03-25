import { showNotification } from '@mantine/notifications'
import useStreamer from 'hooks/useStreamer'
import { Socket } from 'phoenix'
import { createContext, useContext, useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { calculateTimeRemaining } from 'utils/time'
import { ConfigContext } from './ConfigProvider'
import { DonationContext } from './DonationProvider'
import { StatContext } from './StatProvider'
import { SubathonContext } from './SubathonProvider'

export const PhoenixContext = createContext()

const PhoenixProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [streamerChannel, setStreamerChannel] = useState(null)
  const { setDonations, setDonationIndex } = useContext(DonationContext)
  const { setTimeRemaining, setActiveStreamId, setIsSubathonActive } =
    useContext(SubathonContext)
  const { setNetProfit, setStreamStartTime } = useContext(StatContext)
  const {
    userConfig,
    setLanyardConfig,
    setObsConfig,
    setChatConfig,
    setSlobsConfig,
    setTimestampConfig,
    setStatsConfig,
  } = useContext(ConfigContext)
  const streamer = useStreamer(userConfig?.streamazeKey)

  const { sendJsonMessage } = useWebSocket(
    `${process.env.REACT_APP_API_2_WS_URL}`,
    {
      onOpen: () => {
        sendJsonMessage({
          streamerId: streamer?.id,
          streamToken: streamer?.donations_config?.streamlabs_token,
        })
      },
      shouldReconnect: (closeEvent) => true,
      reconnectInterval: 3000,
    },
    !!streamer?.donations_config?.streamlabs_token && !!streamer?.id
  )

  useEffect(() => {
    setLanyardConfig((prev) => ({
      ...prev,
      discordUserId: streamer?.lanyard_config?.discord_user_id,
      apiKey: streamer?.lanyard_config?.api_key,
    }))

    setObsConfig((prev) => ({
      ...prev,
      streamChannelId: streamer?.obs_config?.stream_channel_id,
    }))

    setChatConfig((prev) => ({
      ...prev,
      tiktok: {
        ...prev.tiktok,
        username: streamer?.chat_config?.tiktok_username,
      },
      youtube: {
        ...prev.youtube,
        channel: streamer?.chat_config?.youtube_channel,
      },
      kick: {
        ...prev.kick,
        chatroomId: streamer?.chat_config?.kick_chatroom_id,
        channelId: streamer?.chat_config?.kick_channel_id,
      },
      twitch: {
        ...prev.twitch,
        username: streamer?.chat_config?.twitch_username,
      },
    }))

    setSlobsConfig((prev) => ({
      ...prev,
      streamToken: streamer?.donations_config?.streamlabs_token,
      ttsVoice: streamer?.donations_config?.tts_voice,
      tiktokUsername: streamer?.donations_config?.tiktok_username,
      silentAudioInterval: streamer?.donations_config?.silent_audio_interval,
    }))

    setTimestampConfig((prev) => ({
      ...prev,
      discordChannelId: streamer?.clip_config?.discord_channel_id,
      youtubeChannel: streamer?.clip_config?.youtube_channel,
    }))

    setStatsConfig((prev) => ({
      ...prev,
      tiktokUsername: streamer?.viewers_config?.tiktok_username,
      twitchUsername: streamer?.viewers_config?.twitch_username,
      youtubeChannel: streamer?.viewers_config?.youtube_channel,
      kickChannelName: streamer?.viewers_config?.kick_channel_name,
    }))
  }, [
    streamer,
    setLanyardConfig,
    setObsConfig,
    setChatConfig,
    setSlobsConfig,
    setTimestampConfig,
    setStatsConfig,
  ])

  useEffect(() => {
    if (!userConfig?.streamazeKey) {
      showNotification({
        title: 'Streamaze Key Required',
        message: 'Please enter your Streamaze key in the settings page.',
      })

      return
    }

    const streamerSocket = new Socket(process.env.REACT_APP_API_3_WS_URL, {
      heartbeatIntervalMs: 30000,
    })

    setSocket(streamerSocket)

    return () => {
      if (socket) {
        socket.disconnect()
        streamerChannel.leave()
        setSocket(null)
        setStreamerChannel(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (streamerChannel) {
      streamerChannel.off('expense')
      streamerChannel.off('subathon')
      streamerChannel.off('donation')
      streamerChannel.off('initial_state')
    }

    if (
      socket &&
      !socket.isConnected() &&
      streamer?.id &&
      userConfig?.streamazeKey
    ) {
      socket.connect()

      const ch = socket.channel(`streamer:${streamer?.id}`, {
        userToken: userConfig?.streamazeKey,
      })

      ch.join().receive('ok', (_resp) => {
        setStreamerChannel(ch)
      })

      ch.on('expense', (payload) => {
        const { net_profit } = payload || {}
        setNetProfit(net_profit)
      })

      ch.on('subathon', (payload) => {
        const {
          subathon_seconds_added,
          subathon_start_time,
          subathon_start_minutes,
        } = payload || {}
        setTimeRemaining(() => {
          return calculateTimeRemaining(
            subathon_seconds_added,
            subathon_start_time,
            subathon_start_minutes
          )
        })
      })

      ch.on('donation', (payload) => {
        const { donation, net_profit } = payload || {}
        setNetProfit(net_profit)
        setDonations((prev) => [
          ...prev,
          {
            type: donation.type,
            data: {
              id: donation.id,
              name: donation.sender,
              message: donation.message,
              displayString: donation.display_string,
              amount: donation.amount_in_usd,
              currency: donation.value.currency,
              metadata: donation.metadata,
            },
          },
        ])
      })

      ch.on('initial_state', (payload) => {
        const {
          active_stream: currentStream,
          net_profit: streamerNetProfit,
          last_10_donations: last10Donations,
        } = payload || {}
        const seconds = calculateTimeRemaining(
          currentStream.subathon_seconds_added,
          currentStream.subathon_start_time,
          currentStream.subathon_start_minutes
        )

        if (currentStream.subathon_ended_time === null) {
          setIsSubathonActive(true)
          setTimeRemaining(seconds)
        }

        setNetProfit(streamerNetProfit)
        setDonationIndex(last10Donations.length)
        setActiveStreamId(currentStream.id)
        setStreamStartTime(currentStream.start_time)
        setDonations(
          last10Donations
            .map((donation) => {
              return {
                type: donation.type,
                data: {
                  id: donation.id,
                  name: donation.sender,
                  message: donation.message,
                  displayString: donation.display_string,
                  amount: parseFloat(donation.amount_in_usd),
                  currency: donation.value.currency,
                  metadata: donation.metadata,
                },
              }
            })
            .reverse()
        )
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, streamer?.id, userConfig?.streamazeKey])

  return (
    <PhoenixContext.Provider
      value={{
        socket,
        streamerChannel,
        currentStreamer: streamer,
      }}
    >
      {children}
    </PhoenixContext.Provider>
  )
}

export default PhoenixProvider
