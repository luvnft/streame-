import { Helmet } from 'react-helmet'

const TagSEO = ({
  title = 'Streamaze | Stream Companion',
  description = 'Streamaze is a tool to enhance your livestreaming experience.',
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  )
}

export default TagSEO
