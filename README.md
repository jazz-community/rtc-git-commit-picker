<h1> GitLab Commit Connector </h1>
<p>
What can you do with this "Work Item Editor"-Plugin? <br>
It gives the possibility to work with an gitLab VCS in RTC. <br>
It links gitLab commits to "RTC Work Items" and in reversal adding a backlink to the gitLab commit. <br>
!!! For now we can only load the last 100 commits !!! <br>
</p>

<h2>Version: 1.0.3</h2>
<h4>Features (New):</h4>
<ul>
<li>Fixed some text issues.</li>
<li>Enhanced the login-logic</li>
    <ul>
    <li>Enter-Key acts as login button</li>
    <li>Empty fields are shown red</li>
    <li>Wrong credentials handled</li>
    </ul>
<li>Enhanced the error handling (Most cases now have a proper message)</li>
</ul>

<h2>Older Versions</h2>
<h4>Features:</h4>
<ul>
<li>A possibility where the given commits can be filtered</li>
<li>A sorting mechanism which sorts the commits based on their "commit date"</li>
<li>Commits always sorted descending/ascending by "commit date"</li>
<li>Handling of multiple gitLab locations</li>
<li>Adding "Related Artifacts" links to an "RTC Work Item" based on selected gitLab commits</li>
<li>Adding a "backlink" (Link to "RTC Work Item") to the selected gitLab commits</li>
<li>Current RTC user is mentioned in the "backlink"</li>
<li>Detection of "Already Linked" commits</li>
<li>RTC Links: Now saved as "Git Commit"</li>
<li>Login-Mode: If no "Access Token" is saved, the plugin switches to login mode.</li>
    <ul>
    <li>You can login with your GitLab credentials</li>
    </ul>
</ul>

<h2>TODOS:</h2>
<ul>
<li>Commit overview</li>
    <ul>
    <li>Filters - Add specific fields to search</li>
    <li>Sorting - Sort by different values</li>
    <li>UI - Create columns to display more information like: UserName or Commit date</li>
    </ul>
<li>RTC Links</li>
    <ul>
    <li>Make them "Rich Hover" capable</li>
    </ul>
<li>Misc</li>
    <ul>
    <li>Implement a pagination logic to load more than 100 commits</li>
    <li>Test special server locations (E.g. 123.123.123.123:123)</li>
    </ul>
<li>ErrorHandling (Need to be implemented!)</li>
    <ul>
    <li>Server not reachable</li>
    <li>No Change rights on a WorkItem</li>
    <li>WorkItem changed in the background</li>
    </ul>
</ul>