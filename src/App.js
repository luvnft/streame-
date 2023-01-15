import { MantineProvider } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatLog } from './components/Chat'
import {
  ConfigProvider,
  DonationProvider,
  HopProvider,
  StatProvider,
} from './components/Providers'
import KeypadProvider from './components/Providers/KeypadProvider'
import SidebarProvider from './components/Providers/SidebarProvider'
import GoLive from './pages/GoLive'
import Home from './pages/Home'
import Keypad from './pages/Keypad'
import ServerControl from './pages/ServerControl'
import Settings from './pages/Settings'

const App = () => {
  return (
    <MantineProvider
      withNormalizeCSS
      withGlobalStyles
      theme={{ colorScheme: 'dark' }}
    >
      <HelmetProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <ConfigProvider>
              <KeypadProvider>
                <HopProvider>
                  <DonationProvider>
                    <StatProvider>
                      <SidebarProvider>
                        <Routes>
                          <Route path="/" element={<Navigate to="/sam" />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/home" element={<Home />} />
                          <Route
                            path="/sam"
                            element={
                              <Navigate
                                replace
                                to={`/home?isChat=true&youtubeChat=https://youtube.com/c/sam&tiktokChat=sampepper&isClip=true&clipDiscord=1061689422455767141&clipYT=https://www.youtube.com/c/sam&isObs=true&obsChannel=bondctrl:sam&isStats=true&tiktokStats=sampepper&youtubeStats=https://youtube.com/c/sam&isSlobs=true&streamToken=${process.env.REACT_APP_SAM_SOCKET_TOKEN_ALIAS}&tiktokDonos=sampepper`}
                              />
                            }
                          />
                          <Route
                            path="/sam/save"
                            element={
                              <Navigate
                                replace
                                to={`/settings?isChat=true&youtubeChat=https://youtube.com/c/sam&tiktokChat=sampepper&isClip=true&clipDiscord=1061689422455767141&clipYT=https://www.youtube.com/c/sam&isObs=true&obsChannel=bondctrl:sam&isStats=true&tiktokStats=sampepper&youtubeStats=https://youtube.com/c/sam&isSlobs=true&streamToken=${process.env.REACT_APP_SAM_SOCKET_TOKEN_ALIAS}&tiktokDonos=sampepper`}
                              />
                            }
                          />
                          <Route
                            path="/lofi"
                            element={
                              <Navigate
                                replace
                                to={`/home?isChat=true&youtubeChat=https://www.youtube.com/@LofiGirl&isClip=true&clipDiscord=1061689422455767141&clipYT=https://www.youtube.com/@LofiGirl&isStats=true&youtubeStats=https://www.youtube.com/@LofiGirl&isObs=true&obsChannel=bondctrl:sam&isSlobs=true&streamToken=${process.env.REACT_APP_SAM_SOCKET_TOKEN_ALIAS}`}
                              />
                            }
                          />
                          <Route
                            path="/lofi/save"
                            element={
                              <Navigate
                                replace
                                to={`/settings?isChat=true&youtubeChat=https://www.youtube.com/@LofiGirl&isClip=true&clipDiscord=1061689422455767141&clipYT=https://www.youtube.com/@LofiGirl&isStats=true&youtubeStats=https://www.youtube.com/@LofiGirl&isObs=true&obsChannel=bondctrl:sam&isSlobs=true&streamToken=${process.env.REACT_APP_SAM_SOCKET_TOKEN_ALIAS}`}
                              />
                            }
                          />
                          <Route path="/go-live" element={<GoLive />} />
                          <Route path="/server" element={<ServerControl />} />
                          <Route
                            path="/chat"
                            element={
                              <ChatLog
                                height="100vh"
                                fluid
                                showProfilePicture={false}
                              />
                            }
                          />

                          <Route path="/keypad" element={<Keypad />} />

                          <Route path="*" element={<Navigate to="/home" />} />
                        </Routes>
                      </SidebarProvider>
                    </StatProvider>
                  </DonationProvider>
                </HopProvider>
              </KeypadProvider>
            </ConfigProvider>
          </BrowserRouter>
        </NotificationsProvider>
      </HelmetProvider>
    </MantineProvider>
  )
}

export default App
