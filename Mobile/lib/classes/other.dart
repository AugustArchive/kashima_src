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

class APIStats {
  // How many accounts were registered
  int accounts;

  // How many articles were published
  int articles;

  // The version of the API
  String version;

  /// How many plugins were published
  int plugins;

  /// How many themes were published
  int themes;

  /// Constructs a new instance of [APIStats]
  APIStats({ int accounts, int articles, String version, int plugins, int themes }) {
    this.accounts = accounts ?? 0;
    this.articles = articles ?? 0;
    this.version = version ?? 'v1.0.0';
    this.plugins = plugins ?? 0;
    this.themes = themes ?? 0;
  }
}