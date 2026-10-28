# Putting the site on www.thepomtales.com

The site is hosted for free on GitHub Pages, and your domain at Hostinger points to it.
It takes about 10 minutes of clicking, plus up to a few hours for DNS to update.

## 1. Turn on GitHub Pages

1. Open the repo on GitHub, then **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, branch `main`, folder `/ (root)`. Click **Save**.
3. Under **Custom domain**, enter `www.thepomtales.com` and click **Save**. (The repo already has a `CNAME` file with this domain.)
4. Leave this tab open. You'll come back to tick **Enforce HTTPS** at the end.

## 2. Point the domain at GitHub (Hostinger hPanel)

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com) and open **Domains → thepomtales.com → DNS / Nameservers**.
   (If the domain uses Hostinger's nameservers, you'll see the DNS records table there.)
2. **Delete** any existing records named `@` of type **A** or **AAAA**, and any record named `www` of type **CNAME** or **A**.
   These usually point to Hostinger's parking page and would conflict.
3. **Add** these records:

| Type  | Name | Points to                 | TTL   |
|-------|------|---------------------------|-------|
| A     | @    | 185.199.108.153           | 3600  |
| A     | @    | 185.199.109.153           | 3600  |
| A     | @    | 185.199.110.153           | 3600  |
| A     | @    | 185.199.111.153           | 3600  |
| AAAA  | @    | 2606:50c0:8000::153       | 3600  |
| AAAA  | @    | 2606:50c0:8001::153       | 3600  |
| AAAA  | @    | 2606:50c0:8002::153       | 3600  |
| AAAA  | @    | 2606:50c0:8003::153       | 3600  |
| CNAME | www  | nirvanavision-ai.github.io | 3600  |

The AAAA rows are optional, but they help visitors on IPv6.
Don't touch MX or TXT records if you use email on this domain.

## 3. Finish up

1. Wait for DNS to update. It's often 15–30 minutes but can take up to 24 hours.
   Back in **Settings → Pages**, GitHub shows "DNS check successful" when it's ready.
2. Tick **Enforce HTTPS**. If the box is greyed out, GitHub is still issuing the certificate, so check back in an hour.
3. Visit https://www.thepomtales.com. Plain `thepomtales.com` will redirect to `www` automatically.

## Optional: lock the domain to your account

In your GitHub profile, go to **Settings → Pages → Add a domain**, enter `thepomtales.com`, and GitHub gives you a TXT record to add in Hostinger.
This stops anyone else from claiming your domain on GitHub Pages.
