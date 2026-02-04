---
name : git-commit
description : 사용자가 git commit, push 에 대한 내용을 요청할 때 사용하는 skill

---

# git commit skill
사용자가 git repository 에 내용을 push 해달라고 할 때, 아래 순서로 진행합니다.

## Git commit 순서
- 1. 해당 세션에서 작업한 파일을 `git add`
- 2. add 된 파일을 `git commit` 진행
 - 커밋 메시지는 `git branch` 방법을 사용
- 3. 커밋 후 `git push` 진행
