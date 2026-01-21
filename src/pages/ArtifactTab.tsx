import { useState } from 'react'
import './ArtifactTab.css'

enum MediaType {
  IMAGE = 'image',
  AUDIO = 'audio',
  TEXT = 'text',
  UNSPECIFIED = 'unspecified',
}

function getMediaTypeFromMimetype(mimetype: string): MediaType {
  const lowerMime = mimetype.toLowerCase()

  for (const enumValue of Object.values(MediaType)) {
    if (enumValue === MediaType.UNSPECIFIED) {
      continue
    }

    if (lowerMime.startsWith(enumValue + '/')) {
      return enumValue as MediaType
    }
  }

  return MediaType.UNSPECIFIED
}

function isArtifactImage(mimeType: string): boolean {
  if (!mimeType) {
    return false
  }

  return mimeType.startsWith('image/')
}

function isArtifactAudio(mimeType: string): boolean {
  if (!mimeType) {
    return false
  }

  return mimeType.startsWith('audio/')
}

const DEFAULT_ARTIFACT_NAME = 'default_artifact_name'

export default function ArtifactTab() {
  // Sample artifacts data for demonstration
  const [artifacts] = useState<any[]>([
    {
      id: 'image_1',
      versionId: 1,
      mimeType: 'image/png',
      mediaType: MediaType.IMAGE,
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    },
    {
      id: 'image_1',
      versionId: 2,
      mimeType: 'image/png',
      mediaType: MediaType.IMAGE,
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIgAAAABJRU5ErkJggg=='
    },
    {
      id: 'audio_1',
      versionId: 1,
      mimeType: 'audio/wav',
      mediaType: MediaType.AUDIO,
      data: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAAACoAAABAAgAZGF0YQAAABIAAAAZAAAAAA=='
    },
    {
      id: 'text_1',
      versionId: 1,
      mimeType: 'text/plain',
      mediaType: MediaType.TEXT,
      data: 'Sample text content'
    }
  ])

  const [selectedArtifacts, setSelectedArtifacts] = useState<any[]>([])

  // Initialize selected artifacts
  const getDistinctArtifactIds = () => {
    return [...new Set(artifacts.map((artifact) => artifact.id))]
  }

  const getSortedArtifactsFromId = (artifactId: string) => {
    return artifacts.filter((artifact) => artifact.id === artifactId)
      .sort((a, b) => {
        return b.versionId - a.versionId
      })
  }

  // Initialize selected artifacts on component mount
  if (selectedArtifacts.length === 0 && artifacts.length > 0) {
    const distinctIds = getDistinctArtifactIds()
    const initialSelected = distinctIds.map(artifactId => 
      getSortedArtifactsFromId(artifactId)[0]
    )
    setSelectedArtifacts(initialSelected)
  }

  const getArtifactName = (artifactId: string) => {
    return artifactId ?? DEFAULT_ARTIFACT_NAME
  }

  const onArtifactVersionChange = (event: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const artifactId = selectedArtifacts[index].id
    const selectedVersionId = parseInt(event.target.value)
    const artifact = getSortedArtifactsFromId(artifactId).find(a => a.versionId === selectedVersionId)
    
    if (artifact) {
      const newSelected = [...selectedArtifacts]
      newSelected[index] = artifact
      setSelectedArtifacts(newSelected)
    }
  }

  const downloadArtifact = (artifact: any) => {
    const link = document.createElement('a')
    link.href = artifact.data
    link.download = `${artifact.id}_v${artifact.versionId}`
    link.click()
  }

  const openArtifact = (artifact: any) => {
    if (isArtifactImage(artifact.mimeType)) {
      // Open image in new tab
      window.open(artifact.data, '_blank')
    } else if (isArtifactAudio(artifact.mimeType)) {
      // For audio, we could play it inline or open in new tab
      const audio = new Audio(artifact.data)
      audio.play()
    } else {
      // For other types, open in new tab
      const blob = new Blob([artifact.data], { type: artifact.mimeType })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  return (
    <div className="artifact-tab">
      <div className="artifact-container">
        <h2>Artifact Management</h2>
        
        {artifacts.length === 0 ? (
          <div className="empty-state">No artifacts found</div>
        ) : (
          <div className="artifacts-list">
            {selectedArtifacts.map((artifact, index) => {
              const artifactId = artifact.id
              const versions = getSortedArtifactsFromId(artifactId)

              return (
                <div key={artifactId} className="artifact-box">
                  {index > 0 && <hr className="artifact-separator" />}

                  <div className="artifact-metadata">
                    <button
                      className="artifact-name-button"
                      onClick={() => openArtifact(artifact)}
                    >
                      {getArtifactName(artifactId)}
                    </button>
                  </div>

                  <div className="artifact-metadata">
                    <span>Version: </span>
                    <div className="version-select-container">
                      <select
                        value={artifact.versionId}
                        onChange={(e) => onArtifactVersionChange(e, index)}
                        className="version-select"
                      >
                        {versions.map(version => (
                          <option key={version.versionId} value={version.versionId}>
                            {version.versionId}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="download-button"
                      onClick={() => downloadArtifact(artifact)}
                    >
                      Download
                    </button>
                  </div>

                  <div className="artifact-content">
                    {artifact.mediaType === MediaType.IMAGE && (
                      <div className="artifact-image-container">
                        <img
                          className="generated-image"
                          src={artifact.data}
                          alt={artifact.id}
                          onClick={() => openArtifact(artifact)}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    )}

                    {artifact.mediaType === MediaType.AUDIO && (
                      <div className="artifact-audio-container">
                        <audio controls className="audio-player">
                          <source src={artifact.data} type={artifact.mimeType} />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {artifact.mediaType === MediaType.TEXT && (
                      <div className="artifact-text-container">
                        <pre className="artifact-text">{artifact.data}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}