# 코드세션 배치지시 — 0822 리뷰어 수리 반입 (이슈 #8 선행분)

행선: 코드세션행 (워크플로 파일 수정 — 채팅 커넥터는 `.github/workflows/**` 쓰기 403 실측, 봇 GITHUB_TOKEN 도 불가. 대표 자격증명 git push 만 가능)

## 할 일 (1커밋)

```bash
cp "docs/코드세션_배치지시_0822_리뷰어수리/agent-review.yml" .github/workflows/agent-review.yml
git add .github/workflows/agent-review.yml
git commit -m "fix(ci): 리뷰어 본단계 수리 — 함정 3종 복원 + 실패 PR 코멘트 보고 (#8)"
git push origin main
```

main 직커밋이 막혀 있으면 브랜치 → PR → 머지(관리자 우회 허용). 수리본은 이 폴더의 yml 그대로 — 재작성 금지.

## 바뀜 점 (진단 근거: 본가 dybros-app 검증본 대조 실측)
1. `allowed_bots: "claude,claude[bot]"` 복원 — 워커 봇 PR 에서 본단계 즉시 거부되던 경로 차단
2. 리뷰 게시 gh(Bash) → MCP 코멘트 도구 (기본 Bash 허용목록이 gh 차단)
3. `actions: read` 추가, `workflow_dispatch` 수동 호출 경로 추가
4. 실패 시 스텝별 결론을 PR 코멘트(`<!-- agent-review-error -->`)로 밀어냄 — 채팅이 로그 없이 읽는다
5. automerge 조건 ⑥ 추가 — 무동작 success 를 통과로 오인하지 않게 리뷰어 판정 코멘트를 직접 확인

## 머지 후 검증 (코드세션 몫)
- PR #10 브랜치(claude/token-recheck)에 터치 커밋 1개 push → 리뷰어 재트리거
- 기대값: review 잡 success + PR #10 에 `<!-- agent-review -->` 코멘트. 실패하면 `<!-- agent-review-error -->` 코멘트가 붙으므로 그 스텝 결론을 이슈 #8 에 그대로 옮겨 보고
- 검증 후 PR #10 은 닫고 브랜치 삭제, 이슈 #8 나머지 동기화 항목은 기존 발주문대로 진행

## 대표 몫 (코드세션 불가 시 폴백 — 폰 단독 경로)
GitHub 웹 편집으로 동일 효과: https://github.com/dybroskr-maker/amicojeans-site/edit/main/.github/workflows/agent-review.yml 에 이 폴더 yml 전문을 붙여넣고 커밋(관리자 우회로 main 직커밋 가능).
