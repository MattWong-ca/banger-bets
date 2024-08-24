import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { neynar as neynarHub } from "frog/hubs";
import { neynar } from "frog/middlewares";
import { handle } from "frog/vercel";

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
app.frame('/view', (c) => {
  const castAuthor = c.var.cast?.author.username;
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
          {`Bet on @${castAuthor}'s cast going over/under ___ likes?`}
        </div>
      </div>
    ),
    intents: [
      // This should link them to web UI
      <Button.Link href={`https://github.com/MattWong-ca`}>Go to Mint</Button.Link>,
    ],
  })
})

// For adding the cast action
app.frame("/add", (c) => {
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
          Add Cast Action
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
  { name: "Bet on Virality", icon: "link-external" }
);

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== "undefined";
const isProduction = isEdgeFunction || import.meta.env?.MODE !== "development";
devtools(app, isProduction ? { assetsPath: "/.frog" } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);