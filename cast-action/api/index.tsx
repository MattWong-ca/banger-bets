import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { neynar as neynarHub } from "frog/hubs";
import { neynar } from "frog/middlewares";
import { handle } from "frog/vercel";
import { createSystem } from 'frog/ui';

// const ADD_ACTION_URL = "https://warpcast.com/~/add-cast-action?url=https://bangerbets.vercel.app/api/bet";

const { Box, Text, Image, vars } = createSystem({
  fonts: {
    default: [
      {
        name: 'Open Sans',
        source: 'google',
        style: 'italic',
        weight: 600,
      }
    ],
    manrope: [
      {
        name: 'Manrope',
        source: 'google',
        weight: 400,
      },
      {
        name: 'Manrope',
        source: 'google',
        weight: 700,
      }
    ],
  },
  colors: {
    black: '#000000',
    gray: '#808080'
  },
})

export const app = new Frog({
  title: "BANGER!",
  ui: { vars }, // NOTE: This can be added to Frog docs, as it wasn't there
  assetsPath: "/",
  basePath: "/api",
  hub: neynarHub({ apiKey: "NEYNAR_FROG_FM" })
}).use(
  neynar({
    apiKey: "NEYNAR_FROG_FM",
    features: ["interactor", "cast"],
  })
);

// This is the frame the user sees when they click on the cast action
app.frame('/view', async (c) => {
  const castAuthor = c.var.cast?.author.username;
  const castHash = c.var.cast?.hash;
  const interactor = c.var.interactor?.username;

  // 27 - 43: Fetch the cast likes from Neynar API
  async function fetchLikes(url: string) {
    const options = { method: 'GET', headers: { accept: 'application/json', api_key: 'NEYNAR_API_DOCS' } };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }
  const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`;
  const res = await fetchLikes(url);
  const castLikes = res.cast.reactions.likes_count;

  return c.res({
    image: (
      <div
        style={{
          background: 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            display: 'flex',
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.9,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <Box fontFamily="manrope" fontSize={{ custom: castAuthor!.length < 8 ? '62px' : '52px' }} fontWeight="700">
            {`@${castAuthor}'s cast has ${castLikes} ${castLikes === 1 ? "like" : "likes"}...\nThink it's a banger? 💥\nBet on it! 💰`}
          </Box>
        </div>
      </div>
    ),
    intents: [
      // This should link them to web UI
      <Button.Link href={`https://banger-bets.vercel.app/?${castHash}?${castLikes}?${interactor}?${castAuthor}`}>BET</Button.Link>,
    ],
  })
})

// What the BangerBets bot shows 
app.frame('/challenge/:castHash/:likes/:betAmount/:ogBettorAddress', async (c) => {
  const castHash = c.req.param('castHash');
  const likes = c.req.param('likes');
  const betAmount = c.req.param('betAmount');
  const ogBettorAddress = c.req.param('ogBettorAddress');
  // const challengeBettor = c.var.interactor?.username;

  // 27 - 43: Fetch the cast info from Neynar API
  async function fetchCast(url: string) {
    const options = { method: 'GET', headers: { accept: 'application/json', api_key: 'NEYNAR_API_DOCS' } };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }
  const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`;
  const res = await fetchCast(url);

  const pfp = res.cast.author.pfp_url;
  const authorUsername = res.cast.author.username;
  const authorDisplayName = res.cast.author.display_name;
  const castText = res.cast.text;

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'white',
            width: '85%',
            height: '75%',
            color: 'black',
            fontSize: 60,
            display: 'flex',
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            whiteSpace: 'pre-wrap',
          }}
        >
          <Box>
              <Image borderRadius="256" width="52" height="52" src={pfp} />
              <Box fontFamily="manrope" fontWeight="400" marginLeft={{ custom: '18px' }} marginTop={{ custom: '12px' }}>
                <div style={{ display: 'flex', marginBottom: '18px' }}>
                  <Text weight="700" font="manrope" color="black">{`${authorDisplayName}`}&nbsp;&nbsp;&nbsp;</Text>
                  <Text weight="700" font="manrope" color="gray">{`@${authorUsername}`}</Text>
                </div>
              </Box>
          </Box>
          {`${castText}`}
          {/* <div style={{ display: 'flex', margin: '18px' }}> */}
            {/* <Image borderRadius="256" width="52" height="52" src={pfp} />
            <Box fontFamily="manrope" fontWeight="400" marginLeft={{ custom: '18px' }} marginTop={{ custom: '12px' }}>
              <div style={{ display: 'flex', marginBottom: '18px' }}>
                <Text weight="700" font="manrope" color="black">{`${authorDisplayName}`}&nbsp;&nbsp;&nbsp;</Text>
                <Text weight="700" font="manrope" color="gray">{`@${authorUsername}`}</Text>
              </div> */}
              {/* This works */}
              {/* <div>{`${castText}`}</div> */}
            {/* </Box> */}
          {/* </div> */}
        </div>
      </div>
    ),
    intents: [
      <Button.Link href={`https://warpcast.com/${authorUsername}/${castHash}`}>View Cast</Button.Link>,
      // This should link them to web UI
      <Button.Link href={`https://banger-bets.vercel.app/challenge/?castHash=${castHash}&likes=${likes}&betAmount=${betAmount}&ogBettorAddress=${ogBettorAddress}`}>Challenge Bet</Button.Link>,
    ],
  })
})

// For adding the cast action
app.frame("/add", (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginBottom: '25',
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <Box
            fontSize="64"
            fontStyle="italic"
            fontFamily="default"
            fontWeight="600">
            {`💥BANGER!💥`}
          </Box>
          <Box
            fontSize="24"
            fontFamily="manrope"
            fontWeight="700"
          >
            {/* NOTE: variables don't work unless they're inside {``} */}
            {'Bet on casts going viral with Chiliz Fan Tokens'}
          </Box>
        </div>
      </div>
    ),
    intents: [
      <Button.AddCastAction action="/bet">Add cast action</Button.AddCastAction>,
    ],
  });
});

app.castAction("/bet", async (c) => {
  return c.frame({ path: '/view' })
},
  { name: "BANGER!", icon: "flame" }
);

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);