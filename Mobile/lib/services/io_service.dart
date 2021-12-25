/// Copyright (c) 2019-2020 LiquidBlast
/// 
/// All code contained in this software ("Software") is copyrighted by LiquidBlast and 
/// may not be used outside this project without written permission from LiquidBlast. Art 
/// assets and libraries are licensed by their respective owners.
/// 
/// Permission is hearby granted to use the Software under the following terms and conditions:
/// * You will not attempt to reverse engineer or modify the Software.
/// * You will not sell or distribute the Software under your own name without written permission
/// from LiquidBlast.
/// 
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
/// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
/// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
/// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
/// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
/// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
/// SOFTWARE.

import 'package:path_provider/path_provider.dart';
import 'dart:io';

/// Service to operate Input/Output on the filesystem
class IOService {
  /// Returns the local path
  Future<String> getLocalPath() async {
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  /// Get a file from the main directory
  Future<File> getFile(String path) async {
    var dir = await getLocalPath();
    var file = File('$dir/$path');

    return file.existsSync() ? file : null;
  }

  /// Saves content in a file
  void saveContentInFile(File file, String content) => file.writeAsStringSync(content);
}