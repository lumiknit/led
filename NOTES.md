# Design

휴대폰 키보드에 최적으로 편집할 수 있도록..

일단 가능하면 space & return 키로 온갖 문자를 입력할 수 있게

- 빈 칸에 space 만 입력 시 현재 줄 인덴트
- 빈 칸에 백스페이스 입력 시 현재 줄 디덴트
- 빈 칸에 엔터 누르면 다음 줄에 새로운 내용 입력
- space 2번이면 다음 인수

- 'abc def' 처럼 입력 시 공백을 바꿔서 'abc_def' 로 바꿔줌.

- 줄이 있으면 통째로 순서를 바꾼다든가, 토큰 단위로 복사/삭제를 원함.

- 특정 이름만 변경?

- 자동완성..

- 대충 그 언어 느낌으로 작성하게 하고 싶음.

- 최대한 줄 길이는 짧게, 인덴트는 없도록 


전반적으로 space 는 다음 arg, return 은 sub-lines, backspace 는 나가기ㅓㅓjj
