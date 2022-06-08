import { Octokit } from 'octokit'

export default class Github {
  constructor(token, owner, repo) {
    this.token = token
    this.owner = owner
    this.repo = repo
    this.client = new Octokit({
      auth: this.token
    })
  }

  async upload(content, filename=Date.now()+'.png') {
    const res = await this.client.request(`PUT /repos/${this.owner}/${this.repo}/contents/${filename}`, {
      owner: this.owner,
      repo: this.repo,
      path: filename,
      message: 'upload using github api',
      content: content
    })
    return {res, filename}
  }
}

// const main = async () => {
//   const github = new Github('', '', '')
//   const content = await fs.readFile('', 'binary')
//   const res = await github.upload(Buffer.from(content, 'binary').toString('base64'))
//   console.log(res);
// }

// await main()