import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

export type Repo = {
  name: string;
  description: string;
  language: string;
  stargazers: number;
  link: string;
};

const MyOcto = Octokit.plugin(restEndpointMethods);
const octo = new MyOcto({
  auth: import.meta.env.GH_TOKEN,
});

export const fetchRepos = async (): Promise<Repo[]> => {
  const resp = await octo.rest.repos.listForAuthenticatedUser({
    visibility: "public",
    affiliation: "owner",
  });

  const pinned = resp.data.filter((r) => r.topics?.includes("pinned"));

  const repos = pinned.map((p) => ({
    name: p.name,
    description: p.description ?? "",
    language: p.language ?? "NoLang",
    stargazers: p.stargazers_count,
    link: p.html_url,
  }));

  return repos;
};
