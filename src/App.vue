<template>
  <div>-</div>
</template>

<script setup lang="ts">
import { getInstance } from "idb-fs";
import { onMounted } from "vue";

async function init() {
  const rootDir = await getInstance();
  const dirHandle = await rootDir.getDirectoryHandle("测试文件夹1", { create: true });
  const dirHandleL2 = await dirHandle.getDirectoryHandle("测试文件夹1的子文件夹1", {
    create: true,
  });
  const dirHandleL2_2 = await dirHandle.getDirectoryHandle("测试文件夹1的子文件夹2", {
    create: true,
  });

  const fileHandle = await rootDir.getFileHandle("测试文件1.txt", { create: true });

  const fileHandleL2_1 = await dirHandleL2.getFileHandle(
    "测试文件夹1的子文件夹1的文件.txt",
    { create: true }
  );
  const fileHandleL2_2 = await dirHandleL2.getFileHandle(
    "测试文件夹1的子文件夹1的文件2.txt",
    { create: true }
  );

  // resolve
  dirHandle
    .resolve(fileHandle)
    .then((r) => console.log("resolve:", r))
    .catch(console.error);
  dirHandle
    .resolve(dirHandle)
    .then((r) => console.log("resolve:", r))
    .catch(console.error);
  dirHandleL2_2
    .resolve(dirHandle)
    .then((r) => console.log("resolve:", r))
    .catch(console.error);

  // 遍历
  const tempDir = dirHandle;
  for await (const [key, value] of tempDir.entries()) {
    console.log({ key, value });
  }
  for await (const key of tempDir.keys()) {
    console.log("key:", key);
  }
  for await (const v of tempDir.values()) {
    console.log("v:", v);
  }

  // isSameEntry
  // fileHandle.isSameEntry(fileHandleL2_2).then(r=> console.log("fileHandle.isSameEntry(fileHandleL2_2):", r));
  // fileHandle.isSameEntry(fileHandle).then(r=> console.log("fileHandle.isSameEntry(fileHandle):", r))

  // rootDir.isSameEntry(dirHandle).then(r=> console.log("rootDir.isSameEntry(dirHandle):", r))
  // dirHandle.isSameEntry(dirHandle).then(r=> console.log("dirHandle.isSameEntry(dirHandle):", r))

  // createWritable
  // const contents = "我们都是好孩子我们都是好孩子我们都是好孩子我们都是好孩子我们都是好孩子我们都是好孩子我们都是好孩子我们都是好孩子"
  // const writable = await fileHandleL2_1.createWritable();
  // // Write the contents of the file to the stream.
  // await writable.write(contents);
  // // Close the file and write the contents to disk.
  // await writable.close();

  // getFile
  // fileHandleL2_1.getFile().then(r=> console.log("fileHandle file:", r));
  // fileHandleL2_2.getFile().then(r=> console.log("fileHandleL2_2 file:", r))

  // 文件删除
  // fileHandleL2_1.remove();
  // fileHandleL2_2.remove();

  // 目录删除文件
  // dirHandleL2.removeEntry("测试文件夹1的子文件夹1的文件.txt");
  // dirHandleL2.removeEntry("测试文件夹1的子文件夹1的文件2.txt")

  // 目录删除
  // dirHandleL2.remove({
  //     recursive: true
  // })

  // rootDir.remove({ recursive: true})
}

onMounted(init);
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
