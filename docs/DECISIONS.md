# 결정 기록

아미코 사이트에서 이미 확정하거나 기각한 구조·운영 결정을 기록한다.
새 ADR은 이 표에 빈 번호를 먼저 추가해 번호를 선점한 뒤 작성한다.

| 번호 | 결정 | 판정 | 근거 |
|---|---|---|---|
| [ADR-0001](decisions/ADR-0001-keep-agent-role-separation.md) | `AGENTS.md`와 `CLAUDE.md`의 역할 분리 유지 | 확정 | 두 문서의 현행 내용과 `agent-worker.yml`의 필수 참조 |
| [ADR-0002](decisions/ADR-0002-reject-issues-opened-trigger.md) | 이슈 워커의 `issues.opened` 트리거 추가 금지 | 기각 기록 | `AGENTS.md` 워크플로우 폴더 규칙 |
| [ADR-0003](decisions/ADR-0003-preserve-completed-survey.md) | 답변 회수가 끝난 `survey.html` 수정 금지 | 확정 | `CLAUDE.md` 구조·T2 판정·전역 금지 |

## 작성 규약

1. 인덱스에 다음 번호와 제목을 먼저 추가한다.
2. `docs/decisions/ADR-####-<영문-슬러그>.md` 파일을 작성한다.
3. 채택뿐 아니라 기각 사유와 재검토 조건도 남긴다.
4. 확인되지 않은 제안은 결정으로 등재하지 않는다.
5. **번호는 재사용하지 않는다.** 삭제된 ADR의 번호도 비워둔다.
   여러 주체가 동시에 작업하면 같은 번호로 서로 다른 결정이 둘 생긴다
   (2026-08-27 dybros-app에서 두 세션이 ADR-0005를 각각 쓴 사고). 선점이 유일한 방지책이다.
6. **표에 없는 ADR 파일은 고아다.** 파일만 만들고 인덱스를 빼며오면 다음 주체가 찾지 못한다.
