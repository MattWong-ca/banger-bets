import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { neynar as neynarHub } from "frog/hubs";
import { neynar } from "frog/middlewares";
import { handle } from "frog/vercel";

// const ADD_ACTION_URL = "https://warpcast.com/~/add-cast-action?url=https://betrality.vercel.app/api/bet";

export const app = new Frog({
  title: "BetViral",
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

  // 27 - 43: Fetch the cast likes from Neynar API
  async function fetchLikes(url: string) {
    const options = { method: 'GET', headers: { accept: 'application/json', api_key: 'NEYNAR_API_DOCS' }};
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
  // TO DO: make algo take into account replies, recasts, # of followers?
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
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`Bet on @${castAuthor}'s cast going over or under ${castLikes * 10} likes?`}
        </div>
      </div>
    ),
    intents: [
      // This should link them to web UI
      <Button.Link href={`https://bet-viral.vercel.app/?${castHash}?over?${castLikes * 10}`}>Over</Button.Link>,
      <Button.Link href={`https://bet-viral.vercel.app/?${castHash}?under?${castLikes * 10}`}>Under</Button.Link>
    ],
  })
})

// For adding the cast action
app.frame("/add/:numberOfLikes", (c) => {
  // const numberOfLikes = c.req.param('numberOfLikes');

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          height: "100%",
          textAlign: "center",
          width: "100%",
          display: "flex",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          Add Cast Action with 10 likes
        </div>
      </div>
    ),
    intents: [
      <Button.AddCastAction action="/bet">Add</Button.AddCastAction>,
    ],
  });
});

app.castAction("/bet", async (c) => {
  return c.frame({ path: '/view' })
},
  { name: "Bet on Virality", icon: "flame" }
);

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);