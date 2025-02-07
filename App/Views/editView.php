<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit User</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <div class="container">
        <h1>Edit User</h1>
        <form method="POST" action="update.php">
            <input type="hidden" name="id" value="<?= $user['id'] ?>">
            <input type="text" name="name" value="<?= htmlspecialchars($user['name']) ?>" required>
            <input type="email" name="email" value="<?= htmlspecialchars($user['email']) ?>" required>
            <button type="submit">Update User</button>
        </form>
    </div>

</body>
</html>
