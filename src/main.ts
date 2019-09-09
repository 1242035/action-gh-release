import * as fs from 'fs';
import { setFailed } from '@actions/core';
import { GitHub } from '@actions/github';
import { paths, parseConfig, isTag } from './util';
import { release, upload } from './github';

async function run() {
  try {
    const config = parseConfig(process.env);
    if (!isTag(config.github_ref)) {
      throw new Error(`⚠️ GitHub Releases requires a tag`);
    }
    // todo: validate github_ref is a tag
    const gh = new GitHub(config.github_token);
    let rel = await release(config, gh);
    if (config.input_files) {
      paths(config.input_files).forEach(async (path) => {
        await upload(gh, rel.upload_url, path)
      });
    }
    console.log(`🎉 Release ready at ${rel.html_url}`)
  } catch (error) {
    setFailed(error.message);
  }
}

run();