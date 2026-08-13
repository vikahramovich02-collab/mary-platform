import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../scripts/mary8080-fragments/c1.jsfrag", import.meta.url),
  "utf8",
);

test("узлы автоматизации повторяют размеры и позиции Figma", () => {
  assert.match(source, /w=X\?150:158,hh=X\?65:H\?106:124/);
  assert.match(source, /C\("trigger",39,190\)/);
  assert.match(source, /C\("task1",248,180\)/);
  assert.match(source, /C\("task2",446,180\)/);
  assert.match(source, /C\("condition",638,209,"question"\)/);
  assert.match(source, /C\("yes",849,106\)/);
  assert.match(source, /C\("no",849,274\)/);
  assert.match(source, /Понять, новый это\\nклиент или постоянный/);
  assert.match(source, /Уточнить услугу\\nи удобное время/);
  assert.match(source, /Подтвердить запись\\nи отправить детали/);
  assert.match(source, /Передать сотруднику\\nдля подбора времени/);
});

test("workflow использует семантические типы узлов и видимые порты", () => {
  assert.match(source, /H\?"#262633"/);
  assert.match(
    source,
    /linear-gradient\(180deg,#0064FF 0%,#589AFF 18%,#B1CFFF 100%\)/,
  );
  assert.match(
    source,
    /linear-gradient\(180deg,#FFB000 0%,#FFD36B 28%,#FFF2C4 100%\)/,
  );
  assert.match(source, /left:-5,top:"50%"/);
  assert.match(source, /right:-5,top:"50%"/);
});

test("кнопки и метки сценария используют овальную геометрию Mary", () => {
  assert.match(source, /borderRadius:999/);
  assert.match(source, /children:"Да"/);
  assert.match(source, /children:"Нет"/);
  assert.match(source, /height:36,padding:"0 14px"/);
});

test("сценарий сохраняет переходы в историю, интеграции и команду", () => {
  assert.match(source, /onClick:\(\)=>\{setMenuOpen\(!1\),r\("history"\)\}/);
  assert.match(source, /children:"← К сценарию"/);
  assert.match(source, /\["workflow","Сценарий"\]/);
  assert.match(source, /\["integrations","Интеграции"\]/);
  assert.match(source, /\["team","Команда"\]/);
});

test("меню дополнительных действий раскрывается и требует подтверждения важных изменений", () => {
  assert.match(source, /\[menuOpen,setMenuOpen\]=g\.useState\(!1\)/);
  assert.match(source, /aria-haspopup":"menu"/);
  assert.match(source, /id:"process-actions-menu",role:"menu"/);
  assert.match(source, /children:"История запусков"/);
  assert.match(source, /Тестовый прогон/);
  assert.match(source, /children:"Дублировать процесс"/);
  assert.match(source, /children:S\?"Поставить на паузу":"Возобновить процесс"/);
  assert.match(source, /children:"Архивировать процесс"/);
  assert.match(source, /children:"Удалить процесс"/);
  assert.match(source, /role:"dialog","aria-modal":!0/);
  assert.match(source, /Влияние изменения/);
  assert.match(source, /m\.key==="Escape"/);
  assert.match(source, /document\.addEventListener\("pointerdown",closeOutside\)/);
});

test("экран цифрового отдела следует бизнес-состояниям и держит ресурсы вместе", () => {
  assert.match(source, /\[departmentState,setDepartmentState\]=g\.useState/);
  assert.match(source, /"setup"/);
  assert.match(source, /"active"/);
  assert.match(source, /"decision"/);
  assert.match(source, /"employee"/);
  assert.match(source, /"integrationError"/);
  assert.match(source, /"paused"/);
  assert.match(source, /primaryLabel=currentState==="setup"\?"Продолжить с Mary"/);
  assert.match(source, /children:"Ресурсы отдела"/);
  assert.match(source, /\["connections","Подключения"/);
  assert.match(source, /\["knowledge","База знаний"/);
  assert.match(source, /\["people","Участники"/);
  assert.match(source, /children:"Как будет работать отдел"/);
  assert.match(source, /caption:"AI-агент"/);
  assert.match(source, /Mary · Отдел/);
  assert.match(source, /"data-department-state":currentState/);
  assert.doesNotMatch(source, /children:S\?"Запустить":"Возобновить"/);
});
